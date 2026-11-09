# ADR-002 — Regulatory Classification under the CDSCO Medical Device Software Guidance (2026)

| | |
|---|---|
| **Status** | Proposed — to be confirmed with project guides |
| **Date** | 9 November 2026 |
| **Decided by** | Kartik H — project author |
| **Supersedes** | Nothing. Extends ADR-001, which anticipated this assessment. |
| **Reference** | CDSCO/MD/GD/MDSW/01/2026, *Guidance Document on Medical Device Software*, 21 July 2026 |

## Context

ADR-001 fixed the clinical boundary — PMAS does not diagnose, predict or recommend treatment — and
noted that adding such functionality could change the regulatory classification. CDSCO has since
issued its consolidated guidance on Medical Device Software under MDR-2017.

PMAS 2.0 is a medication-adherence and appointment-support application: it records a prescribed
schedule, reminds the patient, records patient-reported dose events, and lets patients manage
appointments with the pharmacy practice department. It does not interpret symptoms or laboratory
values, calculate doses, triage, or recommend therapy.

The question is whether PMAS is medical device software, and if so, how it is classified and what
pathway applies to a departmental pilot.

## Decision

1. **PMAS is treated as Medical Device Software (MDSW) for the purposes of the pilot.** Although a
   non-device position is arguable — the software records and repeats what a clinician prescribed — the
   adherence summaries are intended to inform departmental review, which is closer to *monitoring* than
   to administration. Treating it as MDSW removes the risk of an under-classification argument.

2. **Intended use is fixed by `docs/14-regulatory-position-cdsco-2026.md` §2** and is the controlling
   statement for every feature.

3. **Classification:** standalone MDSW; state of condition *serious* (chronic therapy); significance
   *inform clinical management*. Under the guidance's Table 2 this is **Class A**, with a documented
   risk that patient-facing use without professional support could be treated as *critical*, giving
   **Class B**. Planning assumption: **Class B** unless departmental oversight is written into the
   deployment model.

4. **Pilot pathway:** evaluation and demonstration are not commercialisation, so the route is a
   **test licence** (Form MD-12/MD-13 domestic; MD-16/MD-17 import) through the **NSWS** portal. A
   manufacturing licence or Chapter IIIB registration is a separate, later decision.

5. **Hard feature constraints**, now regulatory rather than stylistic:

   - no diagnosis, triage, symptom or laboratory-value interpretation;
   - no dose calculation, recommendation or adjustment by the software;
   - adherence figures labelled as patient-reported, never as measured;
   - no clinical-outcome claims in the app, site or promotional material without study evidence;
   - any feature that would *drive* clinical management requires re-classification before it is built.

6. **Labelling:** the application displays product name, version/build, intended use, release date and a
   non-diagnostic statement.

7. **Change control:** a new clinical claim, a new data input type, a change to intended user or
   environment, or a change that could alter clinical action each trigger a re-assessment of intended
   use and risk class.

## Alternatives considered

- **Declare PMAS a non-device administrative tool.** Simpler and possibly defensible, but fragile: the
  moment adherence data is used to inform clinical management, the position fails. Rejected as the
  primary position, retained as a fallback if the guides prefer it.
- **Rely on the general-wellness exclusion.** Not available — PMAS addresses disease therapy, and the
  guidance is explicit that wellness software must have no medical intended purpose.
- **Defer the assessment until after the pilot.** Rejected: the guidance attaches consequences to the
  intended use and to the change history, both of which are cheapest to get right before a pilot.

## Consequences

**Positive** — the intended use is written down and testable; feature requests can be judged against a
stated boundary; the pilot has a defined regulatory route; the repository's existing practices
(version control, SRS, risk file, SBOM, verification) map onto the QMS expectations with only
traceability work outstanding.

**Trade-off** — PMAS takes on documentation and labelling obligations it could arguably have avoided,
and a test licence adds lead time before the pilot. This is accepted in exchange for a defensible
position.

**Watch item** — the Class A versus Class B question turns on how much professional oversight sits
between the patient and the adherence data. If the department reviews adherence summaries and acts on
them, document that oversight; it is the difference between the two classes.

## Boundary statement

> PMAS records and repeats a clinician's prescription, reminds patients, and reports patient-reported
> adherence and appointment activity to the department. It does not diagnose, interpret clinical data,
> calculate or recommend doses, triage, or replace clinical judgement. Any change to that boundary
> requires a new intended-use and risk assessment before implementation.
