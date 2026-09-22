# PMAS — 5-Minute Demo Script

A one-page walkthrough of the PMAS patient app for judges, reviewers, or any
teammate. Anyone should be able to present this after one practice run.

**Setup (before the audience arrives)**

- Open the deployed app on your phone (installed to home screen is best) and
  on a laptop: `https://<your-site>.netlify.app/demo/`
- Have a demo medication already entered: Metformin 500 mg, morning slot
  8:00 AM
- Keep the pharmacist portal open in another laptop tab
- Phone on, notifications enabled (Profile → Enable Reminders)

---

## Minute 0–1 — The problem, in one sentence

> "Half of chronic-therapy patients in India don't take their medicines as
> prescribed. Not because they don't want to — because they don't understand
> the label, in a language they actually read. Chrome Translate changes the
> language; PMAS changes the *comprehension*."

## Minute 1–2 — Consent & language (DPDP story)

1. Show the consent screen: purpose, data-use, withdraw rights — in plain
   language, before any data is collected.
2. Switch the language selector: English → Telugu → Hindi → Kannada → Tamil.
   Point out the whole UI, including safety warnings, changes instantly.
3. One line: "Consent is informed and revocable — DPDP Act 2023 by design,
   not as an afterthought."

## Minute 2–3 — Living with the app (offline-first)

1. Add a medication (or show the pre-entered Metformin).
2. Turn airplane mode ON. Log the morning dose as "Taken".
3. Turn airplane mode OFF — data was never lost: it lived on the device and
   syncs when a connection returns.
4. Tap **Test Reminder** — a notification fires ~30 seconds later even while
   you keep talking.

## Minute 3–4 — The pharmacist's view

1. Open the pharmacist portal: the same patient's adherence appears on the
   dashboard — taken, delayed, missed.
2. Log a missed dose on the phone; refresh the portal — the red flag shows up.
3. One line: "The pharmacist sees who needs a phone call today — not a
   spreadsheet of everyone."

## Minute 4–5 — Research export & close

1. Back on the phone: Profile → **Export De-identified Research Data**.
2. Show the JSON: no name, no phone, no DOB — only a Study ID and study day.
3. Close:

> "Dual-vault architecture: identifying data and research data are separated
> at the database level. The export a researcher downloads cannot contain a
> name, because it never had one to leak. That's PMAS's contribution —
> a compliance-first adherence platform built for Indian pharmacy practice."

---

## If asked

- **"Is it ready for patients?"** — It's a validated demo; the pilot study
  starts after Institutional Ethics Committee approval.
- **"Where's the AI?"** — Deliberately not in the critical path. Phase A is
  deterministic rules and pharmacist-authored content; AI-assisted content
  drafts come later, with human review (see `docs/07`).
- **"What about data privacy law?"** — DPDP Act 2023 mapped in `docs/04`:
  consent, purpose limitation, withdrawal, erasure, audit trail.
- **"Why five languages?"** — the study region is Telugu-first; the four
  others cover the region's mobility (see `docs/01`).
