# 02 — Architecture

## Guiding principle

> **PMAS owns the patient journey and the longitudinal health record. Any AI or intelligence service is a subsystem — consulted, never depended upon.**

The patient app must keep working when the network is down, the backend is asleep (free tier), or an AI service is unavailable. Everything else is built around that constraint.

## System overview

```
                    ┌──────────────────────────────────────┐
                    │            PATIENT (phone)            │
                    │   PMAS PWA — installable, offline-first│
                    └───────────────┬──────────────────────┘
                                    │ HTTPS (when online)
                    ┌───────────────▼──────────────────────┐
                    │          PMAS BACKEND (FastAPI)       │
                    │  /api/v1 … auth · meds · adherence ·  │
                    │  symptoms · appointments · research    │
                    │  JWT + role-based access control       │
                    └───────┬─────────────────────┬─────────┘
                            │                     │
              ┌─────────────▼──────┐    ┌──────────▼───────────────┐
              │  VAULT A (Postgres)│    │  VAULT B (Postgres)       │
              │  Identifiable data  │    │  De-identified clinical  │
              │  users, profiles,   │    │  + HEOR data, study       │
              │  contact, audit     │    │  metadata, exports        │
              └─────────────────────┘    └──────────────────────────┘
                            ▲
              ┌─────────────┴─────────────┐
              │  PHARMACIST PORTAL (web)  │
              │  enrolment · med plans ·   │
              │  adherence dashboard      │
              └───────────────────────────┘
```

## The three layers

### 1. Patient PWA (`patient-app/`)

- Plain HTML/CSS/vanilla-JS progressive web app. No build step, no framework — deliberately, so that it is auditable by non-CS reviewers and loads fast on low-end Android phones.
- **Offline-first**: service worker (`demo/sw.js`) caches the app shell; all patient data writes to `localStorage` first (via `demo/js/db.js`).
- **Sync when online**: `demo/js/api.js` mirrors local changes to the backend when a connection is available, and falls back silently to local-only mode. (Wiring `api.js` into the demo `index.html` is a tracked next step — see [doc 08](08-roadmap.md).)
- **Reminders**: local notification scheduler (`demo/js/reminders.js`) checks medication slots every 60 s and raises in-app toasts + browser notifications. Notification permission is requested on explicit user action only.
- **i18n**: full UI translation layer in 5 languages (`demo/js/i18n.js`) — English, Telugu, Kannada, Tamil, Hindi.

### 2. Backend API (`backend/`)

- FastAPI + SQLAlchemy (async) + PostgreSQL, defined in `main.py`, `database.py`, `schemas.py`, `auth.py`.
- ~20 REST endpoints under `/api/v1`: health, auth (register/login), profile, medications, adherence (today/weekly), symptom telemetry, appointments, pharmacist enrolment + dashboard, research export.
- JWT authentication with three roles: `patient`, `pharmacist`, `admin`.
- Dual-vault data placement enforced at the model layer (see [doc 03](03-data-model.md)).
- Interactive API docs are auto-generated at `/docs` (OpenAPI/Swagger).

### 3. Pharmacist portal (`pharmacist-portal/`)

- Single-page web dashboard that authenticates against the backend, enrolls patients, assigns medication plans, and monitors adherence.

## Architectural decisions and their rationale

| Decision | Rationale |
|---|---|
| PWA over native app | Zero store fees (₹0 vs ₹2,100 + ₹8,200/yr), instant updates, works offline — good enough for a pilot. Native wrapper (Capacitor + FCM) is a planned Phase-3 upgrade for guaranteed background notifications. |
| Vanilla JS over React/Vue | Auditability by pharmacy academics; zero build tooling; smallest attack surface; the app is small enough that a framework buys nothing. |
| localStorage over IndexedDB | The data volumes (a few KB per patient) and the access patterns (simple key reads) don't justify IndexedDB's complexity. Upgrade path documented if pilot data grows. |
| FastAPI over Flask/Django | Native async, automatic OpenAPI docs, Pydantic contracts, and the same language as the research/analysis stack (pandas, statsmodels). |
| Dual-vault in one database (separate schema/tables) vs two databases | Two managed Postgres instances would double cost and operational overhead. Physical separation is enforced at the schema/model layer now; moving Vault B to a separate instance later is a config change, not a rewrite. |
| No microservices | One team member, one deployment unit, 50-patient pilot. Splitting services now would only add failure modes. The module boundaries (routes per domain) leave the door open. |

## Failure behaviour (deliberate)

| Failure | Patient experience |
|---|---|
| Backend unreachable | App works fully offline; data stays local; syncs later. |
| Pharmacist portal down | Patient unaffected; pharmacist loses visibility temporarily. |
| Notification permission denied | In-app toasts continue; adherence logging unaffected. |
| Vault B (research export) unavailable | No impact on care delivery whatsoever. |

## Integration principles (for AI / third-party services)

When PMAS eventually consults an intelligence service (see [doc 07](07-ai-integration-strategy.md)), these rules are non-negotiable:

1. PMAS owns patient workflow and patient context; external services own interpretation only.
2. Integration happens through a **versioned JSON health-data contract**, never through shared databases or internal function calls.
3. AI output passes a **safety/educational-framing layer** before reaching a patient. No probabilities, no diagnoses, no unreviewed medical claims.
4. The AI layer must be degradable: if it is down, PMAS continues full functioning.
5. Every AI interaction is logged (input schema, model/version, output) for auditability.

## Security architecture summary

JWT auth, RBAC, parameterised queries (SQLAlchemy), CORS allow-list, secrets from environment variables, and an append-only audit trail table. Full analysis in [doc 04](04-security-and-dpdp-compliance.md).

## Scaling path (when, not now)

- **Now (pilot, ≤50 patients):** single FastAPI instance + one managed Postgres. Free tiers suffice.
- **~1,000 patients:** paid backend tier (always-on), connection pooling, scheduled background jobs for reminder fan-out.
- **Multi-site:** read replicas, per-site data isolation review, and the native Android wrapper with FCM push.

No Kubernetes, no service mesh, no event bus — those become relevant at a scale this project does not have, and adopting them earlier would consume research time for zero patient benefit.
