# 09 — Deployment

Everything runs on free tiers at pilot scale. Two paths: local development, and the free-tier cloud stack (Netlify + Render + Supabase).

## Local development

**Patient app** (static — any static file server works):

```bash
cd patient-app
python3 -m http.server 5500
# Patient app:    http://localhost:5500/demo/
# Platform site:  http://localhost:5500/
```

> Do not open `demo/index.html` via `file://` — service workers and localStorage behave differently; always use a local server.

**Backend** (Python 3.11+; PostgreSQL 14+ running locally or a Supabase connection string):

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then edit values
python -m uvicorn main:app --reload
# Swagger docs: http://localhost:8000/docs
```

Environment variables (from `.env.example`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (local or Supabase) |
| `JWT_SECRET` | Long random string — generate with `openssl rand -hex 32` |
| `JWT_EXPIRY_HOURS` | Token lifetime (24 default) |
| `CORS_ORIGINS` | Comma-separated allowed origins (add your Netlify URL) |
| `HOST` / `PORT` | Bind address |

**Database migration:**

```bash
psql "$DATABASE_URL" -f backend/migrations/001_initial_schema.sql
```

## Cloud deployment (free tier)

### 1. Database — Supabase

1. Create a free project at supabase.com (region: Mumbai/ap-south-1 if offered).
2. Copy the **connection string** (Settings → Database) into `DATABASE_URL`, using the pooled connection (port 6543) for serverless-friendly access.
3. Run the migration via the Supabase SQL Editor: paste the contents of `backend/migrations/001_initial_schema.sql`.

### 2. Backend — Render

1. Push this repository to GitHub.
2. On render.com: **New → Web Service** → connect the repo.
3. Settings:
   - Runtime: **Python 3**
   - Build command: `pip install -r backend/requirements.txt`
   - Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` *(or set root directory `backend/` and start `uvicorn main:app --host 0.0.0.0 --port $PORT`)*
   - Environment variables: everything from the table above.
4. Deploy. Note the URL, e.g. `https://pmas-api.onrender.com`.

> **Free-tier behaviour:** the service sleeps after ~15 minutes of inactivity; the first request after sleep takes ~30 s. Harmless for a pilot (the patient app is offline-first) — if unacceptable later, the lowest paid tier (~$7/month) keeps it always on.

### 3. Patient app — Netlify

1. On netlify.com: **Add new site → Import from Git** → select this repository.
2. Settings:
   - Base directory: `patient-app`
   - Build command: *(none — static)*
   - Publish directory: `patient-app`
3. Deploy. The patient app is at `https://<site>.netlify.app/demo/`, the platform site at the root.

### 4. Wiring it together

1. In the patient app, set the API base URL for `demo/js/api.js` (the sync layer reads it from a constant / `window.PMAS_API_BASE`).
2. Add the Netlify origin to backend `CORS_ORIGINS`; redeploy the backend.
3. Register a pharmacist via `POST /api/v1/pharmacist/enroll`, then a patient, assign medication plans, and verify the pharmacist dashboard reflects dose logging.

### 5. DNS (optional)

If using a custom domain through Cloudflare: CNAME the domain to the Netlify site; keep Netlify's HTTPS. No special config needed for the API at pilot scale.

## Deployment checklist (before any demo)

- [ ] Patient app loads on an Android phone over HTTPS.
- [ ] Installable (browser shows "Add to Home Screen"; logo correct after install).
- [ ] Airplane-mode test: app opens offline with data intact.
- [ ] Login works against the deployed backend.
- [ ] Dose logging appears on the pharmacist dashboard.
- [ ] Language switch works in all 5 languages.
- [ ] Research export returns de-identified JSON (spot-check for absence of names/phones).

## Cost summary

| Item | Cost |
|---|---|
| Netlify (100 GB bandwidth) | ₹0 |
| Render free web service | ₹0 |
| Supabase free tier (500 MB, 50 connections) | ₹0 |
| Cloudflare DNS | ₹0 |
| Domain (optional, e.g. `pmas.in`) | ~₹800–1,200/year |
| Google Play developer (only if/when wrapping as an Android app) | ₹2,100 one-time |

Operating cost at pilot scale: **₹0/month** (excluding an optional domain).

A legacy deployment guide from the earlier full-stack iteration is retained at [DEPLOYMENT_GUIDE_LEGACY.md](DEPLOYMENT_GUIDE_LEGACY.md) for reference.
