# Changelog

All notable changes to PMAS are documented here. The project uses a single product name — **PMAS** — with no version suffixes in user-facing branding; internal versions are tracked here for development history.

## [Unreleased]

### Changed
- Project reframed as an **independent telepharmacy research project by Kartik H.** — institutional affiliations, dissertation framing and third-party references removed across docs, marketing pages, consent screens and app strings (all 5 languages).
- Product model formalised in the PRD: the 90-day telepharmacy care loop for rural and remote chronic-care patients.

### Added
- Product Requirements Document: `docs/00-product-requirements.md` (problem statement, personas, scope, functional & non-functional requirements, success metrics, risks).
- This repository: consolidated project structure (`patient-app/`, `backend/`, `pharmacist-portal/`, `docs/`).
- Complete documentation set: vision, architecture, data model, security/DPDP mapping, HEOR research design, multilingual content model, AI integration strategy, roadmap, deployment, funding & business, AI-usage disclosure.
- API sync layer (`demo/js/api.js`) added to the patient app source (wiring into the app shell is next — see roadmap).

## History (pre-repository)

### Platform v3 — PWA + AI-era layer
- Installable PWA demo with offline service worker and install prompt.
- AI-crawler/AI-era web layer: `llms.txt`, JSON-LD, canonical URLs, Open Graph / Twitter cards, robots directives.
- Platform website: landing, about, contact, privacy, terms, 404.

### Full-stack iteration
- FastAPI backend: 20+ endpoints (`/api/v1`), JWT auth with RBAC (patient / pharmacist / admin).
- Dual-vault PostgreSQL schema: 8 tables across Vault A (identity/PII) and Vault B (clinical/HEOR).
- Pharmacist portal: enrolment, medication plan assignment, adherence dashboard.
- Research export endpoint producing de-identified, Study-ID-keyed JSON.
- Deployment guide for Netlify + Render + Supabase (free tiers).

### v1.1 feature review (all 10 items implemented)
- Adherence tracking (taken / delayed / missed, per-slot).
- Granular, per-purpose consent capture.
- Study ID + de-identified export path.
- Safety escalation redesign for symptom red flags.
- Complete 5-language translations (English, Telugu, Kannada, Tamil, Hindi).
- Local medication reminders (in-app + browser notifications).
- Patient PDF report.
- Fixed next-due logic and appointment sorting.
- Removed `user-scalable=no` (accessibility fix).

### v1.0 — original prototype
- Single-file offline-first demo (early prototype): consent, profile, medications, dose logging, symptom logging, multilingual UI.
- One-page research concept note (study design, outcomes, population, ethics pathway).

### Branding
- Hexagon-cube logo adopted as the brand icon across the platform; all "Lite" and version suffixes removed from naming — the product is **PMAS**, full stop.
