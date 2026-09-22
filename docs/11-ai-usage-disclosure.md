# 11 — AI Usage Disclosure

PMAS is an AI-assisted project, consistent with modern development practice and with hackathon rules that permit AI use with proper crediting (e.g., MLH-style standards). This page documents **what was AI-assisted and what was human-decided**, so that examiners, collaborators, and hackathon judges can fairly assess the work.

## Summary

The project's **conception, clinical reasoning, and all decisions of substance** are the author's (Kartik H., B.Pharm). AI assistants (LLM-based coding and writing assistants, including Sarvam AI tooling) were used to accelerate implementation and documentation, always under the author's direction and review.

## What AI helped with

| Area | AI's role | Human's role |
|---|---|---|
| Code implementation (patient PWA, FastAPI backend, pharmacist portal) | Drafting code from the author's specifications; refactoring; boilerplate | Specifying every feature; reviewing; testing; accepting/rejecting; making all design decisions |
| Documentation (this `/docs` set) | Drafting from the author's outline and conversations | Choosing what to document; verifying factual claims; approving clinical content |
| Translations | Draft aids for non-English strings | **Final translation authority is human** — every patient-facing string is pharmacist-reviewed (see [doc 06](06-multilingual-counselling-content.md)) |
| Market/funding research | Sourcing and summarising public reports | Judging relevance and applicability; decisions on strategy |
| Architecture review | A senior-architecture review of a proposed PMAS + Healthcare-AI integration was AI-generated | The author commissioned the review; the final adopted strategy ([doc 07](07-ai-integration-strategy.md)) is a human-curated subset with explicit rejections |

## What AI did NOT do

- Choose the research question or study design (pharmacist-led vernacular adherence support is the author's thesis argument).
- Author or approve any clinical content (dose guidance, safety rules, counselling text) — these are and will be pharmacist-authored and reviewed.
- Interact with patients or make clinical decisions.
- Replace qualified clinical judgement or the ethics committee's authority.

## Ongoing commitment

1. Any clinically-material content in the platform carries a named pharmacist reviewer (content database `reviewed_by` field).
2. AI use in the study itself (if any, e.g., transcript analysis) will be disclosed in the study methods section and to the ethics committee.
3. This disclosure will be updated as the project evolves — including wherever AI-usage crediting is required.
