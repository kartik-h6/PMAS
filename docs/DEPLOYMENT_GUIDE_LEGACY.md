# PMAS — Full-Stack Deployment Guide (Legacy)

> Retained from the earlier full-stack iteration for reference. The current deployment documentation is [09-deployment.md](09-deployment.md).

This guide walks you through deploying the PMAS platform from scratch — database, backend, frontend, and pharmacist portal.

## Architecture Overview

```
┌──────────────────┐     ┌──────────────────┐
│  Patient App     │     │ Pharmacist Portal│
│ (Netlify/Cloud)  │     │ (Netlify/Cloud)  │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         └──────────┬─────────────┘
                    │ HTTPS / REST API
                    ▼
         ┌──────────────────────────┐
         │   FastAPI Backend         │
         │ (Render/Railway free tier)│
         └────────────┬────────────┘
                      │
         ┌────────────▼────────────┐
         │  PostgreSQL Database      │
         │ (Supabase free tier)      │
         │ Vault A: PII              │
         │ Vault B: Clinical/HEOR    │
         └──────────────────────────┘
```

---

## Step 1: Set Up the Database (Supabase — Free)

1. Go to [supabase.com](https://supabase.com) → Sign up → Create new project
2. Name it `pmas-db`, choose a region close to your users
3. Wait for the project to provision (2-3 minutes)
4. Go to **SQL Editor** → New query
5. Open the file `backend/migrations/001_initial_schema.sql` from this project
6. Copy the entire SQL content and paste it into the Supabase SQL editor
7. Click **Run** — this creates all 8 tables (users, patient_profiles, medication_plans, adherence_records, symptom_telemetry, appointments, security_audit_trail, study_metadata)
8. Go to **Project Settings** → **Database** → Copy the **Connection string** (the one that starts with `postgresql://`)
9. Replace `[YOUR-PASSWORD]` with the password you set during project creation

You now have a connection string like:
```
postgresql://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres
```

## Step 2: Deploy the Backend (Render — Free)

1. Go to [render.com](https://render.com) → Sign up
2. **New** → **Web Service** → Connect a GitHub repo (or use "Create from template")
3. Upload the `backend/` directory to a GitHub repo, OR use Render's built-in editor
4. Configure:
   - **Name:** `pmas-api`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
5. Go to **Environment** → Add environment variables:
   ```
   DATABASE_URL=postgresql+asyncpg://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres
   JWT_SECRET=generate-a-random-32-char-string-here
   JWT_EXPIRY_HOURS=24
   CORS_ORIGINS=https://your-pmas-frontend.netlify.app,https://your-pharmacist-portal.netlify.app
   ```
6. Click **Create Web Service**
7. Wait for deployment (5-10 minutes on first build)
8. Test: visit `https://pmas-api.onrender.com/docs` — you should see the Swagger API documentation

## Step 3: Deploy the Patient App (Netlify)

1. Go to [app.netlify.com](https://app.netlify.com) → Drag and drop the `demo/` folder
2. You'll get a live URL like `https://pmas-app.netlify.app`
3. **Site Settings** → **Environment Variables** → (optional, the API URL is set via the app)
4. In the patient app, on first load, the API sync layer (`api.js`) will prompt for the backend URL — enter your Render URL from Step 2

## Step 4: Deploy the Pharmacist Portal (Netlify)

1. In Netlify, drag and drop the `pharmacist-portal/` folder
2. You'll get a live URL like `https://pmas-portal.netlify.app`
3. On first load, it will prompt for the API URL — enter the same Render URL

## Step 5: Create the First Pharmacist Account

1. Open the pharmacist portal URL in your browser
2. Click "Register as Pharmacist"
3. Enter your phone number and a password
4. You're now logged in as a pharmacist
5. You can now enroll patients from the dashboard

## Step 6: Connect Your Domain (Cloudflare)

1. In Netlify (patient app) → **Domain Settings** → **Add custom domain**
   - Example: `pmas.yourdomain.com`
2. In Cloudflare DNS:
   - Add a **CNAME** record: `pmas` → `pmas-app.netlify.app`
   - Set proxy to DNS-only (gray cloud) for first verification
3. Repeat for the pharmacist portal: `portal.yourdomain.com`
4. For the backend (Render):
   - In Render → **Settings** → **Custom Domain**
   - Add `api.yourdomain.com`
   - In Cloudflare: Add CNAME `api` → `pmas-api.onrender.com`
5. Once verified, enable Cloudflare proxy (orange cloud) for all three

## Step 7: Test the Full Flow

1. **Pharmacist enrolls a patient** via the portal
2. **Patient opens the app** on their phone → goes through consent
3. **Patient adds a medication** → data syncs to backend (and saves locally as offline fallback)
4. **Patient taps Taken/Delayed/Missed** → adherence record syncs to backend
5. **Patient logs a symptom** → telemetry syncs to backend → red flag check runs server-side
6. **Pharmacist checks dashboard** → sees aggregated adherence stats and red flag alerts

---

## Free Tier Limits

| Service | Free Tier | Limit |
|---------|-----------|-------|
| Supabase | Free | 500MB database, 50,000 monthly rows |
| Render | Free | 750 hours/month (web service sleeps after 15 min inactivity) |
| Netlify | Free | 100GB bandwidth/month |

For hackathon demos and early pilot studies, these limits are more than sufficient.

## Local Development

```bash
# Clone the backend
cd backend
pip install -r requirements.txt
cp .env.example .env  # Fill in your values
uvicorn main:app --reload --port 8000

# In another terminal, serve the frontend
cd demo
python -m http.server 5500

# Open browser to http://localhost:5500
```

## API Documentation

Once the backend is running, visit:
- **Swagger UI:** `https://your-api-url/docs`
- **ReDoc:** `https://your-api-url/redoc`

These auto-generated docs show every endpoint, expected request format, and response schema.

---

## Troubleshooting

**Backend won't start:** Check that `DATABASE_URL` uses `postgresql+asyncpg://` (not just `postgresql://`)

**CORS errors in browser:** Add your frontend URLs to `CORS_ORIGINS` environment variable in Render

**Database connection failed:** Verify your Supabase password in the connection string. The connection must use port 5432 (or 6543 for Supabase connection pooler)

**PWA install not showing:** The site must be served over HTTPS. Netlify and Render both provide HTTPS by default.
