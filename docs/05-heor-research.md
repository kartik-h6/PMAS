# 05 — HEOR & Research Design

Health Economics and Outcomes Research (HEOR) is not an afterthought in PMAS — it is the reason the data architecture exists. This document defines the research design, outcome measures, and data pipeline.

## Why PMAS generates HEOR-grade data

Pharmacoeconomic research in India is constrained by data availability: every study re-collects adherence data by hand. PMAS produces it as a by-product of normal patient care, de-identified by design. The economic context that makes this valuable:

- Out-of-pocket expenditure still accounts for the majority of India's health financing — adherence failures land directly on household finances and are a documented driver of catastrophic health expenditure.
- The Indian Reference Case for economic evaluation (published 2023) now gives researchers a standard methodological baseline; what is missing is longitudinal, consented, real-world adherence data of the kind PMAS collects.
- Comparable trials (e.g., community-based adherence interventions for diabetes/hypertension in rural India) run full cost-effectiveness analyses alongside adherence outcomes — PMAS is architected to support exactly that study shape.

## Study design (planned pilot)

**Title (working):** *Impact of a Pharmacist-led, Vernacular, Digital Adherence Support Platform (PMAS) on Medication Adherence and Outcomes in Chronic Disease Patients.*

| Element | Specification |
|---|---|
| Design | Single-arm, pre-post interventional study (Phase A); matched-control comparison (Phase B, if site participation allows) |
| Setting | Community pharmacy / outpatient counselling clinic (site to be finalised — Andhra Pradesh region) |
| Population | Adults ≥18 with ≥1 chronic condition on long-term oral therapy; able to use a smartphone (self or caregiver-assisted) |
| Sample size | Pilot: n = 30–50 (feasibility); powering for the confirmatory study is computed from pilot variance |
| Duration | 12 weeks per participant (baseline → intervention → follow-up) |
| Primary outcome | Change in adherence score (MARS-5 and/or MMAS-8) from baseline to week 12 |
| Secondary outcomes | PMAS-logged adherence percentage; symptom red-flag events; pharmacist interventions count; hospital/OPD visits; patient satisfaction (CSQ-8); medicine-related questions resolved |
| Ethics | Institutional Ethics Committee approval **before** any participant recruitment; CTRI registration if required by the committee; informed consent in the participant's language (see [doc 06](06-multilingual-counselling-content.md)) |

## Outcome measures & instruments

| Instrument | Purpose | Notes |
|---|---|---|
| **MMAS-8** (Morisky) | Adherence, hypertension/diabetes standard | License terms must be checked with the copyright holder before use |
| **MARS-5** | Adherence, general | Free-to-use; shorter; fits in-app administration |
| **Adherence % (device-captured)** | Objective counterpoint to self-report | Derived from `adherence_records`: taken / (taken + delayed + missed) over the window |
| **CSQ-8** | Patient satisfaction with pharmacist service | |
| **EQ-5D-5L (optional)** | Quality of life → QALY path for future cost-utility analysis | Indian value set exists; adds translational value to the thesis |

Device-captured adherence from PMAS is itself a methodological contribution: most Indian adherence studies rely on self-report alone, which overestimates adherence.

## The HEOR data pipeline

```
Patient app (offline-first)
   │ dose events, symptoms, vitals — consented, purpose-limited
   ▼
PMAS backend — Vault B (clinical tables)
   │
   ├── Care path: pharmacist dashboard, red-flag alerts
   │
   └── Research path (requires research-consent flag = true):
         ▼
     De-identification layer  (Study ID substitution; Vault A excluded)
         ▼
     HEOR export  (GET /api/v1/research/export — versioned JSON/CSV)
         ▼
     Analysis dataset  (one row per patient-day: adherence, symptoms, costs)
         ▼
     Pharmacoeconomic analysis  (cost-effectiveness, cost-utility, budget-impact)
```

## Analysis plan (indicative)

1. **Descriptive:** adherence trajectory per patient-week; distribution of dose statuses; red-flag frequencies.
2. **Primary test:** paired comparison of adherence score pre/post (Wilcoxon signed-rank or paired t as appropriate to distribution).
3. **Secondary:** interrupted time-series on device-captured weekly adherence %; negative binomial for missed-dose counts.
4. **Economic (extension):** combining adherence change with published cost-of-non-adherence parameters for a modelled cost-offset analysis; the pilot's contribution is the instrument, with a full CEA planned as future work.
5. **All analyses pre-registered**; de-identified analysis data and scripts versioned in this repository under `analysis/` when the study begins (public only after publication).

## Red-flag (safety escalation) rules

Symptom telemetry triggers pharmacist follow-up per clinical rules configured in the app; the pilot version:

| Trigger | Action |
|---|---|
| Pain score ≥ 7 | Pharmacist call within 24 h |
| Systolic ≥ 180 or diastolic ≥ 110 (hypertensive range) | Pharmacist review; advise physician contact |
| Temperature ≥ 39°C or documented fever ≥ 3 days | Escalation to physician |
| Any suspected serious adverse drug reaction | Pharmacist-reportable event; documented in audit trail |
| ≥ 3 consecutive missed doses of any critical medication | Counselling outreach |

The exact thresholds are reviewed and signed off by the supervising pharmacist/physician before the study — they are clinical configuration, not code constants.

## Publication pathway

| # | Paper | Target journal tier |
|---|---|---|
| 1 | Platform design: dual-vault, DPDP-aligned, vernacular architecture | Indian Journal of Pharmacy Practice / Journal of Pharmaceutical Health Services Research |
| 2 | Adherence intervention results (pilot pre-post) | Pharmacy practice / clinical pharmacy journal |
| 3 | Methodological: device-captured vs self-reported adherence in an Indian setting | Research in Social & Administrative Pharmacy (longer term) |

## Data governance during the study

- The investigator (author) and study team have access to Vault A only for care delivery and consent administration.
- All analysis uses exports from Vault B via the research endpoint; every export is audit-logged.
- De-identified analysis data are retained per the study protocol's retention clause; identifiable data are erased after the statutory period or consent withdrawal.
