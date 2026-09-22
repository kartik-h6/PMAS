# 06 — Multilingual Counselling Content Model

This is the heart of the thesis contribution: a **pharmacist-authored, plain-language, multilingual medication counselling database**. It is what distinguishes PMAS from every translation-based approach.

## The comprehension model

For each medication, counselling content is authored at three levels:

1. **What it is (identity):** the medicine's purpose in the patient's colloquial idiom — "sugar medicine", "BP tablet", "blood thinner" — not "oral antihyperglycaemic".
2. **How to take it (behaviour):** time-of-day anchors tied to daily routine ("after breakfast", "before sleeping"), not abstract schedules ("q12h").
3. **What to watch for (safety):** two to four plain-language warnings that matter most for that drug, and the missed-dose rule.

Plus, where genuinely useful, a **visual cue** (sun, plate with food, moon icons) that carries meaning independent of literacy.

## Content schema

One JSON object per medication per language. The file lives in the patient app (`content/` directory, planned) and is served offline.

```json
{
  "medicine_id": "metformin-500",
  "language": "te",
  "levels": {
    "identity": "ఈ మందు షుగర్ (మధుమేహం) కోసం. రక్తంలో చక్కర పరిమాణం తగ్గిస్తుంది.",
    "behaviour": "రోజూ రెండు సార్లు — తిన్న తర్వాత ఒక్కటి, రాత్రి భోజనం తర్వాత ఒక్కటి. ఖాళీ కడుపుతో వేసుకోవద్దు.",
    "safety": [
      "కడుపులో మంట, విరేచనాలు వస్తే ఫార్మాసిస్ట్‌ను కలవండి.",
      "ఒక మోతాదు మర్చిపోతే — గుర్తొచ్చిన వెంటనే వేసుకోండి; రెండు మోతాదులు కలిపి వేసుకోవద్దు."
    ]
  },
  "visual_cues": ["after_food", "twice_daily"],
  "reading_level": "colloquial",
  "author": "Pharmacist, PMAS",
  "reviewed_by": "…",
  "version": "1.0"
}
```

## Authoring rules

1. **Written by a pharmacist, not translated by a machine.** Machine translation may be used as a *draft aid*, but every string is reviewed and edited by someone fluent in the language and clinically trained. The author's and reviewer's names are recorded per item.
2. **Colloquial disease terms are correct, not "corrected".** If patients say "sugar disease", the content says "sugar disease".
3. **One sentence, one idea.** No compound sentences.
4. **Behaviour anchors reference the day's routine**, not clock abstractions.
5. **Safety lists are capped at four items** — the items a pharmacist would say first in a counselling session.
6. **Each language is authored natively**, not back-translated from English; English is one voice among five, not the source of truth.
7. **Versioned and dated** — content changes are reviewable, because counselling quality is part of the study intervention.

## Coverage plan

| Phase | Medications | Source of list |
|---|---|---|
| Thesis core (v1) | Top 50 most-prescribed chronic-therapy medicines at the study site | Prescription audit at the site |
| Expansion (v2) | Top 100 + common OTC interactions | Site + essential medicines list |
| Scale (future) | Formulary-driven | Partner-site formularies |

Five languages per medication: English, Telugu, Kannada, Tamil, Hindi. (Telugu first — the study region's primary language — then the others.)

## Validation

Content quality is itself measured in the study:

- **Readability check** per language by an independent bilingual pharmacist.
- **Patient comprehension spot-check** during pilot (teach-back method on a sample).
- Content version is recorded alongside study data so the intervention is reproducible.

## Relationship to the rest of the system

- The `medication_plans.instructions_localized` column (see [doc 03](03-data-model.md)) carries the counselling text for the specific plan assigned to a patient, in the patient's `preferred_language`.
- The reminder notification shows the **behaviour** level text — the shortest actionable sentence — not the drug name alone.
- Content is bundled into the PWA so it works offline, with version refresh on sync.

This database — pharmacist-validated, five languages, reproducibly versioned — is PMAS's primary defensible asset. Competitors can copy features; they cannot shortcut the clinical authorship.
