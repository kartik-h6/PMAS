# 08 — Roadmap

Honest status tracking. Dates are relative to the M.Pharm academic calendar (sessions begin at RIPER Anantapur; hackathon target: NLTH 2026, September 5).

## Current status — what exists today

| Component | Status | Notes |
|---|---|---|
| Patient PWA (5 languages, offline, adherence, symptoms, reports, consent) | ✅ Built | `patient-app/demo/` |
| Platform website (landing, about, privacy, terms, SEO/AI-crawler layer) | ✅ Built | `patient-app/` root |
| FastAPI backend (20+ endpoints, JWT, RBAC, dual-vault) | ✅ Built | `backend/` — not yet deployed |
| PostgreSQL schema (8 tables) | ✅ Built | `backend/migrations/` |
| Pharmacist portal | ✅ Built | `pharmacist-portal/` — not yet wired to deployed backend |
| API sync layer (`api.js`) | ⚠️ Written, **not wired** | Needs `<script>` include in `demo/index.html` + auth flow |
| PWA notifications | ⚠️ Basic | In-app toasts work; browser notification path needs `registration.showNotification()` fix |
| Deployment (Netlify + Render + Supabase) | ❌ Pending | Guide ready: [doc 09](09-deployment.md) |
| Vernacular counselling content database | ❌ Not started | The thesis core — see [doc 06](06-multilingual-counselling-content.md) |
| Study protocol, IEC approval | ❌ Not started | Blocks all human-participant data collection |

## Phase 1 — Demo-ready (target: immediately)

*Goal: everything works on a phone for demonstration (hackathon, HOD, department).*

- [ ] Deploy patient app to Netlify (free tier).
- [ ] Deploy backend to Render + database to Supabase (free tiers).
- [ ] Wire `api.js` into `demo/index.html`; connect register/login + sync.
- [ ] Fix reminder notifications to use `registration.showNotification()`.
- [ ] Add "Enable reminders" (permission on user tap) and "Test reminder" (fires 30 s later) for demos.
- [ ] End-to-end test: pharmacist enrols patient → assigns meds → patient logs doses → dashboard reflects it.
- [ ] Demo script document: 5-minute walkthrough (language switch, offline mode, adherence log, pharmacist dashboard, research export).

## Phase 2 — Pilot-ready (months 1–3 of sessions)

*Goal: ready for the ethics committee and real patients.*

- [ ] Counselling content database v1: top-50 site medications × 5 languages, pharmacist-authored ([doc 06](06-multilingual-counselling-content.md)).
- [ ] Study protocol written and submitted to the Institutional Ethics Committee.
- [ ] MARS-5 instrument integrated into the app (baseline + week-12 administration).
- [ ] Counselling log for pharmacists (what was counselled, when, outcome).
- [ ] Consent-withdrawal self-service flow in-app.
- [ ] Audit-trail coverage for every privileged endpoint.
- [ ] MSME (Udyam) registration; DPIIT startup recognition.

## Phase 3 — Research-in-progress (months 3–6)

*Goal: run the pilot; produce thesis data.*

- [ ] Enrol 30–50 patients; 12-week follow-up per [doc 05](05-heor-research.md).
- [ ] HEOR export pipeline exercised with real (de-identified) data.
- [ ] Interim analysis; conference abstract.
- [ ] Native Android wrapper (Capacitor + FCM) if background notifications prove necessary for adherence fidelity during the pilot.
- [ ] Grant applications submitted (PRIP, BIRAC SPARSH/BIG, SISFS — see [doc 10](10-funding-and-business.md)).

## Phase 4 — Thesis & scale decision (months 6–12)

*Goal: defend the dissertation; decide on incubation.*

- [ ] Thesis writing and defence.
- [ ] Publication #1 submitted (platform design paper).
- [ ] Publication #2 prepared (adherence results).
- [ ] Incubation go/no-go: team, funding, hospital partnerships.
- [ ] If go: AI Phase B/C per [doc 07](07-ai-integration-strategy.md), ABDM/ABHA exploration, WhatsApp Business API for reminder reach.

## Dependency map

```
Deployment ──► Demo (Phase 1)
                  │
Content DB ──► IEC approval ──► Pilot study ──► Thesis
                  (Phase 2)         (Phase 3)     (Phase 4)
DPIIT/MSME ──► Grant applications ──┘
```

The critical path runs through **content authoring and IEC approval**, not through more software. The platform is ahead of the research; the roadmap's job is to let the research catch up.
