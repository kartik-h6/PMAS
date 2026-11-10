# 15 — Labelling and Intended-Use Statement (in-app)

Implements action 4 of `docs/14-regulatory-position-cdsco-2026.md` §8: define the label content that
must be visible to a user, so the application can be labelled consistently as it is built.

**Why this exists.** The CDSCO guidance (CDSCO/MD/GD/MDSW/01/2026) expects software to carry a
defined label — product and software name, version or build, manufacturer, release date, intended use
and storage conditions — and treats the intended-use statement as fundamental to classification.
Labelling is also the surface on which a regulator reads what the software claims to do. Getting the
wording right is therefore a safety control, not a formality.

---

## 1. Required label fields

| Field | Value for PMAS | Where it appears |
|---|---|---|
| Device / product name | PMAS | App header, About screen, printed leaflet |
| Software name | PMAS — Medication Adherence & Appointment Support | About screen |
| Version / build | Release version (e.g. `2.0.0`) and build identifier | About screen, app footer |
| Manufacturer | Kartik H (project author) — until an institutional manufacturer is named | About screen |
| Licence number | *Not applicable before licensing* — display "Not licensed for commercial distribution" | About screen |
| Release date | Date of the deployed build | About screen |
| Intended use | The statement in §2 below, verbatim | Consent screen, About screen |
| Storage conditions | Not applicable (software) — state "No special storage conditions" | About screen |
| Non-diagnostic statement | §2, second paragraph | Consent screen, About screen, every exported report |

---

## 2. The two statements

### 2.1 Short form — for persistent UI (footer, consent screen)

> **PMAS** — medication reminders and appointment support. Version {version}. It does not diagnose, does
> not advise on doses, and does not replace your doctor or pharmacist.

### 2.2 Full form — for the About screen and exported reports

> **PMAS** is a medication-adherence and appointment-support application for adult patients of a
> hospital pharmacy practice department. It records a medication schedule exactly as prescribed by your
> clinician, reminds you at those times, records whether you report taking, missing or skipping a dose,
> and lets you manage appointments with the department.
>
> **It does not** diagnose any condition, interpret symptoms or laboratory results, calculate or
> recommend doses, or decide your treatment. All clinical decisions remain with your treating
> clinician.
>
> Adherence figures shown in this application are **reported by you**; they are not a measurement of
> whether a medicine was actually taken.
>
> Version {version} · Build {build} · Released {date} · Author: Kartik H · Not licensed for commercial
> distribution.
>
> If you feel unwell, contact your doctor or pharmacist. This application is not for emergencies.

---

## 3. Placement rules

1. **Consent screen** — full intended-use statement, before the patient can proceed.
2. **About / Profile** — full label block (§1 fields plus §2.2).
3. **Persistent footer** — short form, on every screen where medicines or adherence are shown.
4. **Exported reports and PDFs** — full form in the footer of the document.
5. **Printed counselling leaflet** — short form plus the department name.

---

## 4. Wording that must not appear

These phrases create a clinical claim the software does not support, and would move the intended use
along the significance axis:

- "diagnose", "detect", "screen for", "predict your condition";
- "recommended dose", "you should take", "increase/decrease your dose";
- "safe for you", "will improve your health", "prevents complications";
- "clinically proven" — until a study supports it;
- any disease probability or risk score presented to a patient.

---

## 5. Version discipline

The displayed version must match the deployed build. The service-worker cache name is already bumped
on every release; the label must be updated in the same commit, so the version a user sees is the
version actually running. A label that lags the build is a labelling defect, not a cosmetic one.

---

## 6. Status

Specification only. No application code is changed by this document; wiring the label into the consent
screen, About screen, footer and report templates remains open under issue #55.

*Internal specification. Not legal advice, and not a regulatory submission.*
