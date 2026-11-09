# 14 — Regulatory Position under the CDSCO Medical Device Software Guidance (2026)

| | |
|---|---|
| **Guidance referenced** | CDSCO/MD/GD/MDSW/01/2026 — *Guidance Document on Medical Device Software*, issued 21 July 2026 |
| **Statutory basis** | Drugs and Cosmetics Act, 1940 and Medical Devices Rules, 2017 (MDR-2017) |
| **Status** | Working position for the pilot; to be confirmed with the project guides before any patient use |
| **Related** | `docs/adr/ADR-001-clinical-scope-and-diagnostic-boundary.md`, `docs/adr/ADR-002-regulatory-classification.md` |

> This is an internal engineering and planning position, not legal advice. The guidance itself states
> that it is for public awareness and that readers must rely on the statutory provisions of MDR-2017.

---

## 1. What the guidance actually says

- It applies to software that **attracts the medical-device definition** and is **intended for a medical
  purpose** — diagnosis, prevention, monitoring, treatment or alleviation of disease or disorder.
- It **does not** apply to software intended only for general wellness, a healthy lifestyle, or measuring
  body parameters for ordinary tracking and fitness — provided there is no medical intended purpose.
- **Not all software used in a hospital is MDSW.** Administrative software is outside the scope.
- The **intended use statement is fundamental** to classification, and must state the software's clinical
  role (decision support, driving a device, definitive diagnosis or treatment recommendation).
- Risk classes run **A (low) to D (high)**. For standalone software, a two-axis table is used:
  the **state of the condition** (critical / serious / non-serious) against the **significance of the
  information** (treat-or-diagnose / drive clinical management / inform clinical management).
- **QMS expectations** rest on IS/IEC 62304 (software lifecycle), IS/ISO 14971 (risk management) and
  IS/IEC 82304-1 (health software safety), with an SRS, design specification, version control, a
  software bill of materials, cybersecurity controls, post-market surveillance and change management.
- **Pathways:** test licences (for investigation, evaluation, demonstration or training — not for sale)
  are filed through the **NSWS** portal; manufacturing, import and registration through the
  **CDSCO MD Online** portal. Class A non-sterile, non-measuring devices are exempt from licensing but
  still require registration for commercialisation.
- The guidance also expects **interoperability and consent-driven data access consistent with the DPDP
  Act, 2023**, and auditable digital traceability.

---

## 2. PMAS intended use statement

This is the controlling statement. Every feature must be consistent with it; anything that is not, is
out of scope until this statement is formally revised.

> **PMAS** is a medication-adherence and appointment-support application for **adult patients** of a
> hospital pharmacy practice department, used by the **patient or their caregiver** at home and by
> **departmental pharmacy staff** in an outpatient setting.
>
> It **(a)** records a medication schedule exactly as prescribed by the treating clinician, **(b)**
> reminds the patient at those times, **(c)** records whether the patient reports taking, missing or
> skipping a dose, **(d)** lets patients request and manage appointments with the department, and **(e)**
> presents that recorded information to the patient and to the department.
>
> PMAS **does not** diagnose, interpret symptoms or laboratory values, calculate or recommend doses,
> select or change therapy, or triage. **All clinical decisions remain with the treating clinician.**
>
> **Intended condition:** chronic therapy — diabetes, hypertension, cardiovascular and respiratory
> disease.
> **Contraindication:** not for emergency use, not for acute deterioration, and not for medicines where
> the patient is expected to adjust the dose themselves.

---

## 3. Determination: is PMAS medical device software?

Component by component:

| Component | Function | Position |
|---|---|---|
| Appointment booking and scheduling | Administrative | **Non-device** |
| Account, profile, login | Identity and access | **Non-device** |
| Medication schedule entry | Transcribes a prescription; makes no decision | **Boundary** |
| Reminders | Repeats a prescribed time | **Boundary** |
| Dose logging (taken / missed / skipped) | Records patient-reported events | **Boundary** |
| Adherence summaries and reports | Aggregates patient-reported data for review | **Boundary — closest to "monitoring"** |
| Reviewed counselling leaflet | Visual aid to a counselling conversation | **Non-device**, while content is pre-reviewed and not patient-specific advice |

**Conclusion.** PMAS is designed to sit on the boundary, and two positions are defensible:

- **(a) Non-device** — an administrative and communication tool that records and repeats what a
  clinician prescribed. Strongest where there is no clinical claim and no interpretation.
- **(b) MDSW (standalone)** — if adherence summaries are used to inform clinical management, or if PMAS
  claims to improve treatment outcomes.

**Recommendation:** treat PMAS as **MDSW** for the pilot. It costs little and removes the risk of an
under-classification argument later.

---

## 4. Classification, if treated as MDSW

- **Type:** standalone (no hardware dependency).
- **State of condition:** *serious* — chronic disease, moderate progression, not time-critical.
- **Significance of information:** *inform clinical management* — it presents recorded information; it
  does not drive treatment or diagnose.
- **Table 2 result:** serious + inform → **Class A**.

**The caveat that matters.** The guidance notes that standalone MDSW used by **non-clinical users in a
serious situation, without support from specialised professionals**, may be treated as used in a
*critical* situation — which moves serious + inform from Class A to **Class B**.

Because PMAS is **patient-facing**, plan for **Class B unless departmental professional oversight is
documented** in the intended use and in the deployment model.

---

## 5. Pathway for the pilot

- The pilot is **evaluation and demonstration, not sale**. That is the **test licence** pathway
  (Form MD-12/MD-13 for domestic manufacture; MD-16/MD-17 for import), filed through **NSWS**.
- The guidance explicitly names **innovators and researchers** among its audience, so this is the
  intended route for a departmental evaluation.
- Commercialisation later would require a manufacturing licence or Chapter IIIB registration, and a
  separate decision.

---

## 6. What this changes in the repository

### 6.1 Hard feature constraints

These are now regulatory constraints, not preferences:

1. **No symptom interpretation, no laboratory-value interpretation, no diagnosis, no triage.**
2. **No dose calculation, dose recommendation, or dose adjustment by the software.** The schedule is
   transcribed, never derived.
3. **Adherence figures must be labelled as patient-reported**, not measured or verified.
4. **No claim of improved clinical outcomes** in the application, the website, or promotional material
   until a study supports it.
5. **Any feature that would drive clinical management** (alerts that direct action, risk scoring,
   escalation logic that acts without a clinician) requires re-classification first.

### 6.2 Labelling

The application must display, and keep current: product name, software version or build, intended use,
release date, and the statement that it is not a diagnostic device and does not replace clinical
judgement.

### 6.3 Change control

A change requires re-assessment of the intended use and risk class if it:

- introduces a new clinical claim;
- introduces a new type of data input;
- changes how information is presented in a way that could change clinical action;
- changes the intended user, environment or patient population.

Minor changes that stay within the validated behaviour (wording, layout, performance tuning) are handled
through the normal pull-request and changelog process.

---

## 7. QMS mapping — what the repository already provides

| Expectation (62304 / 14971 / 82304-1) | Existing artefact |
|---|---|
| Software requirements specification | `docs/00-product-requirements.md`, `docs/08-roadmap.md` |
| Architecture and design description | `docs/02-architecture.md`, `docs/03-data-model.md` |
| Risk management file | Security audit `REPORT.md` / `findings.json`, ADR-001, this document |
| Version control and change traceability | Git history, `CHANGELOG.md`, pull-request workflow |
| Software bill of materials | `backend/requirements.txt` (exact-pinned), front-end dependency list |
| Cybersecurity controls | Security audit, `SECURITY.md`, pinned CI actions, non-root container |
| Verification and validation | `pytest` suite, CI workflows, headless-browser E2E checks |
| Release control | Pinned GitHub Actions, service-worker cache versioning |
| Post-market surveillance | **Not yet implemented** — required only on commercialisation |

The gap is not practice; it is **traceability**. The work is to point each requirement at the artefact
that already satisfies it, which this table begins.

---

## 8. Open actions

1. **Confirm the intended use statement** with the project guides — it governs everything else.
2. **Record the device / non-device position** formally (see ADR-002).
3. **If treated as a device:** obtain a test licence before the pilot begins.
4. **Add in-app labelling** (version, intended use, non-diagnostic statement).
5. **Add the change-control rule** to `CONTRIBUTING.md` so contributors cannot add a clinical feature
   without re-assessment.
6. **Revisit on any scope change** — particularly anything resembling adherence-based alerts, risk
   scores, or dose advice.

---

*Internal position paper. Not legal advice, and not a regulatory submission.*
