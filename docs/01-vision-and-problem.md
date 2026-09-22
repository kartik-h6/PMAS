# 01 — Vision & Problem

## Vision

Every chronic-disease patient in India should be able to open their phone, understand **what their medicines are for, how to take them, and what happens if they don't** — in their own language, at their own literacy level — with a pharmacist watching over their adherence and stepping in when something goes wrong.

PMAS (Pharmacist-led Medication & Adherence Support) is the platform built around that vision. It is designed, first and foremost, as a **research instrument** for an M.Pharm (Pharmacy Practice) dissertation, and secondarily as an incubation-ready product.

## The problem, precisely

### 1. Non-adherence is enormous and expensive

Adherence to long-term therapy for chronic illnesses in developed countries averages ~50%, and is lower in developing countries (WHO, *Adherence to Long-Term Therapies: Evidence for Action*). Non-adherence drives disease progression, hospitalisations, and avoidable out-of-pocket expenditure. In India — where out-of-pocket spending still dominates health financing — the consequences land directly on households.

### 2. The counselling gap

A typical Indian outpatient encounter leaves the patient with:

- a prescription in English or a doctor's handwriting,
- seconds to low minutes of instruction,
- no structured follow-up on whether the medicine was ever taken correctly.

Community pharmacists — the most accessible healthcare professionals — are structurally excluded from the loop in most digital tools.

### 3. The comprehension gap (the thesis argument)

Existing multilingual apps *translate*. PMAS *explains*. The distinction:

| | Translation (e.g., browser auto-translate) | PMAS vernacular counselling |
|---|---|---|
| Unit of work | Words / sentences | **Clinical concepts** |
| Example output | "Take Metformin 500mg twice daily with food" → translated word-for-word | "ఈ మందు షుగర్ వ్యాధి కోసం. తిన్న తర్వాత తీసుకోండి. ఉదయం, రాత్రి ఒక్కోటి." ("This medicine is for sugar disease. Take after eating. Morning and night, one each.") |
| Covers *why* the medicine matters | No | Yes |
| Covers missed-dose action | No | Yes |
| Uses the patient's colloquial term for their disease | No | Yes ("sugar disease" not "Diabetes Mellitus") |
| Written/validated by | Machine | **Pharmacist** |

**Translation changes language. PMAS changes comprehension.** That sentence is the core thesis claim, and the pharmacist-authored vernacular content database (see [doc 06](06-multilingual-counselling-content.md)) is the evidence base for it.

### 4. Research data is fragmented

When pharmacoeconomic researchers in India want adherence data, they re-collect it by hand for every study. No commonly available tool produces **DPDP-compliant, de-identified, HEOR-structured** adherence data as a by-product of normal patient care. PMAS is designed to be exactly that tool.

## Who PMAS is for

| User class | Their job in the system |
|---|---|
| **Patient** (primary) | Receives counselling, medication reminders, dose tracking, symptom logging, adherence reports |
| **Pharmacist** (the "P" in PMAS) | Enrols patients, assigns medication plans, monitors adherence and symptoms, intervenes on red flags |
| **Researcher** (the dissertation) | Receives de-identified, Study-ID-keyed exports of adherence + clinical outcomes |
| **Administrator** (future) | User management, knowledge-base governance, audit review |

## Competitive landscape (summary)

The adherence-app market splits into three camps, none of which occupies PMAS's position:

| Camp | Examples | What they miss |
|---|---|---|
| Global consumer apps | Medisafe, MyTherapy | No pharmacist in the loop; translation instead of vernacular counselling; no HEOR architecture; Medisafe's free tier is limited and its data-sharing with pharma is a documented privacy criticism |
| Indian reminder apps | DoseDost, PillPal (WhatsApp-based) | Reminder delivery only; no pharmacist workflow, no research layer, no consent architecture |
| Hackathon / academic AI projects | various symptom-predictor + chatbot builds | Patient-facing disease prediction (regulatory liability) without clinical governance; no adherence tracking at all |

**PMAS's defensible position** is the combination: pharmacist-in-the-loop + vernacular comprehension + dual-vault privacy architecture + HEOR-ready data. Each alone is reproducible; the combination is not, because the vernacular content database requires pharmacy expertise to author and validate, and the trust architecture requires both domains.

A full market and funding analysis is in [doc 10](10-funding-and-business.md).

## Success criteria

For the dissertation:

1. Working platform deployed with real patients (pilot, target n = 30–50).
2. Measurable pre/post change in adherence (validated scale — see [doc 05](05-heor-research.md)).
3. A reusable, pharmacist-validated multilingual counselling content database.
4. Publication(s) in a peer-reviewed pharmacy practice journal.

For incubation (beyond the thesis):

5. A DPDP-aligned architecture that can pass a hospital's vendor review.
6. Grant funding (PRIP / BIRAC / SISFS) — see [doc 10](10-funding-and-business.md).
