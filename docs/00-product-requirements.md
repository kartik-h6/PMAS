# PMAS — Product Requirements Document

| | |
|---|---|
| **Product** | PMAS — Pharmacist-led Medication & Adherence Support |
| **Author & Owner** | Kartik H, B.Pharm — independent builder |
| **Version** | 1.0 — Draft for review |
| **Date** | 22 September 2026 |
| **Status** | Personal project. No institutional affiliation claimed at this stage. |

---

## 1. Problem Statement

Rural and semi-urban patients with chronic conditions — diabetes, hypertension, cardiovascular and respiratory disease — typically receive their prescriptions during brief visits to urban multi-speciality hospitals or local Primary Health Centres (PHCs). They then return to villages 20–150 km away and manage the next 60–120 days of therapy alone.

In that gap between visits:

1. **Counselling is a one-time event.** It happens at a busy counter, often in clinical language, rarely in the patient's mother tongue. Recall fades within days.
2. **No pharmacist touchpoint exists.** Missed doses, side effects and confusion surface only at the next visit — frequently as complications.
3. **PHC pharmacists have no visibility.** They serve everyone who walks in, but cannot prioritise the chronic patients who most need follow-up.
4. **Non-adherence is the silent outcome.** A large share of chronic-therapy patients in India do not take medicines as prescribed, driving avoidable complications and out-of-pocket costs.

PMAS addresses this gap with a **telepharmacy service model**: a vernacular, offline-capable patient application plus a pharmacist worklist that together deliver structured pharmacist support during the ~90-day gap between hospital visits.

## 2. Vision

> Every chronic-therapy patient returns home from the hospital with a pharmacist in their pocket — in their own language, with or without network.

**Positioning.** PMAS is not a translation app, not a generic reminder app, and not a dispensing service. It is the continuity layer for pharmacist-led care between visits. Chrome Translate changes the language; PMAS changes the comprehension.

## 3. Users & Personas

| # | Persona | Context | Primary need |
|---|---------|---------|--------------|
| P1 | **Rural patient**, 45–70 | Low-end Android, Telugu-first, low digital literacy, intermittent connectivity, sometimes a shared family phone | Understand and remember medicines at home, in own language |
| P2 | **Family caregiver**, 25–50 | Often the actual phone user; manages an elderly parent's therapy | Know what the parent should take, and whether they are taking it |
| P3 | **Pharmacist** (hospital or PHC) | The service provider; limited time per patient | Know who needs attention today, call them, document it |
| P4 | **Researcher / HEOR analyst** | Consumes de-identified adherence data (future role) | Reliable outcome data without identities |

## 4. Product Model — the 90-Day Care Loop

1. **Assisted enrollment (face-to-face moment).** At the hospital or PHC counter, the pharmacist sets up the app on the patient's phone, enters the prescription, and hands the phone back — a 10-minute interaction.
2. **Vernacular counselling at home.** The patient opens the app and sees each medicine explained in plain language, with icons, in their chosen language. Works with zero network.
3. **Reminders & logging (offline-first).** Doses remind at their times; taken / delayed / missed is one tap; symptoms and vitals get logged; data syncs whenever signal returns.
4. **Pharmacist daily worklist.** The portal ranks patients: 2+ missed doses, red-flag readings, refill running out, follow-up due — "who do I call today."
5. **Call, counsel, document.** One tap to dial or open WhatsApp; the counselling outcome is logged as evidence of the intervention.
6. **Escalation & routing.** Worrying patterns route to the PHC medical officer or back to the specialist. The app never diagnoses; it makes the referral fast.

## 5. Jobs to Be Done

- Patient: "Help me remember and understand my medicines at home, in my language."
- Caregiver: "Tell me what my father is supposed to take, and if he's taking it."
- Pharmacist: "Tell me which of my patients needs my call today — and give me the phone number."
- Researcher: "Give me adherence data I can analyse, without names in it."

## 6. Scope

**MVP (v1.0) — built or in active development**

- Offline-first PWA; UI in EN / TE / KN / TA / HI
- Medication plans with morning / afternoon / night slots
- Dose logging (taken / delayed / missed) and symptom tracker
- In-app toasts + PWA notifications (Enable Reminders, Test Reminder)
- Pharmacist portal: enrollment, medication plans, adherence dashboard
- De-identified research export (Study ID + study day)
- Cloud sync layer (opt-in, silent offline fallback)
- Assisted-enrollment flow, call worklist, counselling call log (planned, next)

**Phase 2 — pilot-ready**

- Counselling content database: top-50 chronic-therapy medicines × 5 languages, pharmacist-authored
- MARS-5 adherence instrument (baseline + week-12)
- Consent-withdrawal self-service; audit-trail coverage on privileged endpoints
- MSME (Udyam) + DPIIT registrations

**Out of scope (deliberately)**

- In-app video calling (WhatsApp is used instead — it is already rural India's video infrastructure)
- E-prescription / ABDM integration, medicine dispensing or delivery
- AI-generated medical advice (AI may assist content drafting, always with human pharmacist review)
- iOS native application

## 7. Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| F1 | Patient registers via guided consent screen (language choice, purpose, data use, withdrawal rights) | Built |
| F2 | Full UI translation in 5 languages, instant switching | Built |
| F3 | Medication plans with time slots and reminders | Built |
| F4 | Dose logging and adherence computation | Built |
| F5 | Symptom and vitals logging with safety-flag logic | Built |
| F6 | Offline storage; opportunistic sync when online | Built |
| F7 | PWA notifications via service worker; Enable/Test buttons | Built |
| F8 | De-identified research export (no names, phones, DOBs; Study ID + study day) | Built |
| F9 | Pharmacist portal: enrollment, plans, adherence dashboard | Built |
| F10 | Assisted enrollment mode (pharmacist sets up patient's phone) | Planned (P1) |
| F11 | Pharmacist call worklist (missed doses, red flags, refills, follow-ups) | Planned (P1) |
| F12 | Click-to-call / WhatsApp deep links + counselling call log | Planned (P1) |
| F13 | Counselling content database, top-50 medicines × 5 languages | Planned (P2) |
| F14 | MARS-5 instrument administration | Planned (P2) |

## 8. Non-Functional Requirements

- **Offline-first:** after first load, all core patient functions work with no network; sync is opportunistic.
- **Vernacular quality:** Telugu-first content bar; plain language at ~6th-grade reading level; icon-supported.
- **Privacy (DPDP Act 2023):** consent-first onboarding; dual-vault data model (identifying vs clinical/HEOR); withdrawal and erasure paths; audit trail; data residency in India (Mumbai region).
- **Low-end devices:** target 2 GB RAM Android phones; app core small enough for patchy 3G; shared-phone friendly.
- **Zero budget:** free-tier infrastructure only; no paid services anywhere in the critical path.
- **Guaranteed channel:** in-app toasts always; installed-app notifications when possible; the pharmacist's phone call is the guaranteed intervention channel.

## 9. Architecture Overview

Three tiers, all free-tier:

1. **Presentation** — static PWA (patient app) and pharmacist portal, served from Netlify; service-worker caching gives offline behaviour.
2. **Application** — FastAPI (Python) backend on Render: JWT auth, role-based access, dual-vault data access rules, de-identified research export endpoint.
3. **Data** — PostgreSQL on Supabase (Mumbai region): 8-table schema separating identifying data (Vault A) from clinical/HEOR data (Vault B), linked by Study ID.

GitHub is the single source of truth (code, docs, issues, task board); deployments pull from it automatically.

## 10. Success Metrics

**Product health**

- Assisted enrollment completes in < 10 minutes
- ≥ 80% of scheduled doses logged
- Missed-dose follow-up contact within 48 hours
- Top-50 medicine counselling coverage in the patient's chosen language

**Outcome measures (when the pilot study runs)**

- MARS-5 change, baseline → week 12
- Patient-reported constructs: satisfaction, trust, understanding, experience (Likert scales)
- Pharmacist time per patient per month
- Zero privacy incidents

## 11. Constraints & Assumptions

- Single non-CS founder: strategy, requirements, validation, testing and deployment by the author; implementation is AI-assisted under his direction (publicly disclosed).
- ₹0 budget for the entire v1 lifecycle.
- Free-tier service limits are tolerated (backend cold starts, database auto-pause).
- No institutional affiliation at this stage; future academic adoption (if any) will add formal supervision and ethics review at that point.

## 12. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| App-closed notifications unreliable on low-end Androids | The pharmacist's call is the guaranteed channel; WhatsApp nudges; FCM via Android wrapper later |
| Backend cold-start delay (free tier) | Acceptable for pilot; monitoring; upgrade path documented |
| Database auto-pause on inactivity | Weekly activity check during any study period |
| Patient digital literacy | Assisted enrollment; icon-first UI; caregiver as primary user |
| Regulatory ambiguity around telepharmacy in India | Counselling + documentation only; no dispensing decisions; consent recorded; follow telemedicine-style norms |
| Single-maintainer bus factor | Full documentation, repo, task board — any successor can continue |
| Scope creep | This document is the boundary; changes require a versioned update |

## 13. Roadmap

- **Phase 1 — Working application (current):** deploy full stack, assisted enrollment, call worklist, counselling log, end-to-end test.
- **Phase 2 — Pilot-ready:** content database, MARS-5, consent withdrawal, audit trail, registrations.
- **Phase 3 — Pilot study & research:** patient enrollment, 12-week follow-up, outcome analysis.
- **Phase 4 — Publication & scale decision:** papers, thesis material, incubation go/no-go.

## 14. Authorship & Credits

Conceived, specified, planned and validated by **Kartik H**. Implementation was AI-assisted under his direction; this is publicly disclosed. No institutional affiliation is claimed at this stage of the project.
