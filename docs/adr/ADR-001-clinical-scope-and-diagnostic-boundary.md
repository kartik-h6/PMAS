# ADR-001 — Clinical Scope and Diagnostic Boundary

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 24 September 2026 |
| **Decided by** | Kartik H — project author |

## Context

PMAS is a pharmacist-led medication counselling and adherence support platform. Its research objective is to study whether pharmacist-led, multilingual counselling and structured adherence support improve medication understanding and medication-taking behaviour in chronic-therapy patients.

During architectural review, the possibility of incorporating symptom-to-disease classification or predictive health intelligence (including third-party AI components) was considered.

## Decision

PMAS will not include diagnostic, disease-classification, or patient-facing predictive clinical functionality within its current research scope.

The current system will:

- provide pharmacist-reviewed medication counselling;
- support multilingual patient comprehension;
- record adherence and follow-up information;
- support pharmacist-led monitoring and escalation workflows;
- preserve longitudinal research data using study identifiers, not identities.

PMAS will not currently:

- diagnose diseases;
- classify patients as having a disease;
- generate patient-facing disease probabilities;
- recommend treatment based on an automated disease prediction;
- replace pharmacist, physician, or other qualified clinical judgement;
- represent AI-generated output as clinical conclusion.

## AI boundary

AI may be investigated as an optional supporting technology for activities such as information retrieval, content organisation, administrative assistance, research exploration, and professional-facing knowledge support.

Any future clinical-intelligence feature must undergo a separate intended-use, risk, validation, ethical, and regulatory assessment before incorporation into PMAS — and must remain behind the professional surface with human review, never in the patient-facing application.

Adding diagnostic or predictive functionality could materially change PMAS's intended purpose, clinical risk profile, validation requirements, and potentially its regulatory classification under India's Medical Devices Rules framework (CDSCO guidance on Medical Device Software, 2026). That is a deliberate future decision, not an accidental default.

## Human oversight

The clinical boundary will be reviewed by an appropriately qualified pharmacist during protocol development. Before any human-subject research begins, the study protocol, consent process, data handling, counselling content, escalation rules, and intended use of PMAS will be subject to ethics review.

## Consequences

**Positive** — clearer clinical scope; lower unnecessary clinical risk; easier explanation to reviewers and funders; AI remains optional rather than a dependency.

**Trade-off** — PMAS will not attempt to demonstrate diagnostic AI capability in its current phase. Future predictive functionality can be evaluated as a separate research or product decision with its own validation and regulatory assessment.

## Boundary statement

> PMAS supports pharmacist-led medication counselling, adherence support, and continuity of care. It is not a diagnostic system and does not provide automated disease predictions or treatment decisions.
