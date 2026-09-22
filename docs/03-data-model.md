# 03 — Data Model

The canonical schema is [`backend/migrations/001_initial_schema.sql`](../backend/migrations/001_initial_schema.sql). This document explains it.

## Dual-vault design

The single most important data-architecture decision in PMAS:

| | Vault A — Identity (PII) | Vault B — Clinical & HEOR |
|---|---|---|
| Purpose | Who the patient is | What happened clinically |
| Tables | `users`, `patient_profiles` | `medication_plans`, `adherence_records`, `symptom_telemetry`, `appointments`, `study_metadata` |
| Contains | Name, phone, DOB, emergency contact, consent records | Medications, dose events, vitals, symptoms, study IDs |
| Who may query | Authenticated owner or treating pharmacist (role-checked, audited) | Research exports **only after** de-identification |
| Deletion semantics | Erasing Vault A cascades and severs the link; Vault B rows lose identifiability | Aggregated/de-identified data may persist per study protocol |

Both vaults live in one PostgreSQL database today (schema-level separation, enforced in the SQLAlchemy models). Moving Vault B to a physically separate instance is a deployment change, not an application rewrite — the model layer already treats them as separate domains.

**Why this matters:** under the DPDP Act 2023, the research value of adherence data is only realisable if the identifiable layer can be severed cleanly. Designing this in from day one — rather than bolting anonymisation onto a monolithic schema later — is what makes PMAS's HEOR exports defensible before an ethics committee and, eventually, a hospital's vendor review.

## Tables (8 total)

### Vault A — Identity & access

**`users`** — authentication for all roles
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Unguessable, non-enumerable |
| `phone_number` | VARCHAR(15), UNIQUE | Login identifier (phone-first design for India) |
| `password_hash` | VARCHAR(255) | Never plaintext |
| `role` | ENUM `patient` / `pharmacist` / `admin` | RBAC basis |
| `preferred_language` | VARCHAR(10), default `en` | Drives vernacular counselling content |
| `is_active`, `created_at` | | |

**`patient_profiles`** — demographics + DPDP consent audit
| Column | Type | Notes |
|---|---|---|
| `user_id` | UUID, UNIQUE FK | 1:1 with users |
| `hospital_mrn` | VARCHAR(50) | Site medical record number |
| `full_name`, `emergency_contact_name/phone`, `date_of_birth`, `gender`, `blood_group` | | PII |
| `known_allergies`, `chronic_conditions` | TEXT | Clinically necessary PII |
| `consent_timestamp` | TIMESTAMPTZ NOT NULL | When consent was given |
| `consent_version` | VARCHAR(20) NOT NULL | Which consent text version |
| `consent_checks` | JSONB | **Granular per-purpose consent flags** (treatment, research, data sharing — each separately recorded, per DPDP purpose-limitation) |
| `consent_status` | BOOLEAN | Currently active / withdrawn |

### Vault B — Clinical & HEOR

**`medication_plans`** — pharmacist-assigned regimens
- Slot model: `frequency_morning/afternoon/night` booleans + `morning_time` etc. — this mirrors exactly how Indian prescriptions are communicated and how the patient app's UI and reminders work.
- `instructions_localized` TEXT — the vernacular counselling text for this medication (see [doc 06](06-multilingual-counselling-content.md)).
- `prescribed_by` FK to users — pharmacist accountability.
- Bounded by `start_date` / `end_date` for research windows.

**`adherence_records`** — one row per dose event
- ENUM status: `taken` / `delayed` / `missed`.
- `UNIQUE(patient_id, medication_id, dose_date, dose_slot)` — a dose can be recorded exactly once; re-recording updates rather than duplicates.
- This table is the heart of every adherence metric and HEOR export.

**`symptom_telemetry`** — patient-reported outcomes + vitals
- `pain_score` (0–10 CHECK), `systolic_bp` / `diastolic_bp`, `temperature`, `weight_kg`, free-text `symptoms_observed` / `side_effects` / `additional_notes`.
- `red_flag_triggered` — set when the safety-escalation rules fire (see [doc 05](05-heor-research.md) for the rule set); drives pharmacist follow-up.

**`appointments`** — clinic visits with sorting by date/time.

**`study_metadata`** — the de-identification bridge
- 1:1 with `users`; assigns a `study_id` (e.g. `PMAS-2026-042`) that is **the only identifier** permitted in research exports.

### Compliance

**`security_audit_trail`** — append-only log of who did what, to which resource, from which IP. Required by DPDP accountability obligations; written on consent changes, exports, and privileged access.

## Health data contract (for research exports and future AI integration)

All cross-boundary data movement uses one versioned JSON shape. The research export endpoint (`GET /api/v1/research/export`) is the reference implementation:

```json
{
  "study_id": "PMAS-2026-042",
  "schema_version": "1.0",
  "observation_period": { "from": "2026-09-01", "to": "2026-11-30" },
  "medications": [{
    "medicine_name": "Metformin",
    "dosage": "500 mg",
    "slots": ["morning", "night"],
    "active": true
  }],
  "adherence": [{
    "dose_date": "2026-09-18",
    "dose_slot": "morning",
    "status": "taken",
    "recorded_at": "2026-09-18T08:04:00+05:30"
  }],
  "symptoms": [{
    "log_date": "2026-09-18",
    "pain_score": 2,
    "systolic_bp": 138,
    "diastolic_bp": 86,
    "red_flag": false
  }],
  "derived": {
    "adherence_pct_30d": 86.7,
    "missed_doses_30d": 11
  }
}
```

Rules enforced by the export layer:

1. **No Vault A columns ever leave the boundary.** No name, phone, DOB, or MRN appears in an export.
2. **Study ID is the sole key.** Re-identification requires Vault A access, which is role-gated and audited.
3. **Schema is versioned** (`schema_version`) so longitudinal studies survive model evolution.
4. Exports are audit-logged rows in `security_audit_trail`.

## Local (offline) storage in the patient app

`demo/js/db.js` implements the same conceptual model in `localStorage` keys: `consent`, `profile`, `medications`, `adherence`, `symptoms`, `appointments`, `language`, `theme`. The online sync layer (`demo/js/api.js`) maps these to the REST endpoints. Local storage is cleared when the patient withdraws consent — mirroring the DPDP erasure obligation in the offline context.

## Data lifecycle

| Stage | Policy |
|---|---|
| Collection | Purpose-limited, consented, minimal (DPDP data-fiduciary duty) |
| Storage | Encrypted in transit (TLS); at-rest encryption inherited from managed Postgres |
| Use | Care delivery (live) + research (de-identified only) |
| Retention | Until consent withdrawal or study completion + statutory period |
| Deletion | Vault A erasure cascades identity; Vault B retains only de-identified aggregates |
| Breach | 72-hour notification workflow (see [doc 04](04-security-and-dpdp-compliance.md)) |
