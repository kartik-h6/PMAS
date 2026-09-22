# 10 — Funding & Business

Market context, monetisation path, and the grant ladder. Figures are from public market research (2025–2026 reports) and are directional, not audited.

## Market context

| Market | Size & growth |
|---|---|
| Global medication adherence platforms | ~$4.2 B (2025) → ~$10.8 B (2034), ~12.8% CAGR |
| India medication management | ~$1.09 B (2024) → ~$2.36 B (2035), ~7.3% CAGR |
| India digital therapeutics | ~$260 M (2025) → ~$1.14 B (2034), ~17.9% CAGR |
| Global medication reminder apps | ~$628 M (2025) → ~$2.07 B (2034), ~14.2% CAGR |

Asia-Pacific is the fastest-growing region across these categories, with India's chronic-disease burden (100 M+ people with diabetes; hypertension prevalence among the world's highest) and the National Digital Health Mission creating demand-side tailwinds.

## Positioning

PMAS is not a consumer reminder app. It is a **pharmacist-operated adherence + research platform** — closer to a clinical workflow tool that generates HEOR-grade real-world data than to a Medisafe competitor. That positioning determines who pays:

| Buyer | What they buy | Realistic timeline |
|---|---|---|
| **Grant bodies** (non-dilutive) | The research mission + DPDP-compliant architecture | 3–12 months |
| **Hospitals / pharmacy schools** | Pharmacist workflow SaaS (per-clinic subscription) | 12–24 months |
| **Pharma / CROs** | De-identified real-world adherence data studies | 12–24 months (needs 200+ patient dataset) |
| **Insurers / public health programs** | Population adherence monitoring | 24–36 months |
| **Patients** | Nothing — patient-side is free by design | — |

## Grant ladder (India, current)

| Scheme | Amount | Fit notes |
|---|---|---|
| **Startup India Seed Fund (SISFS)** | Up to ₹50 L | Requires DPIIT recognition + incubation with a partner TBI |
| **BIRAC SPARSH / BIG** | Up to ₹50 L | Affordable social-health innovation — strong fit for PMAS's rural-vernacular angle |
| **PRIP Scheme (Dept. of Pharmaceuticals)** | Up to ₹5 Cr (early stage) | Pharma-sector innovation; PMAS sits at TRL 4–5; calls open periodically (second call opened Aug 2026) |
| **IHFC / IIT-Delhi MedTech calls** | Up to ₹2–5 Cr | Digital health; requires DPIIT recognition |
| **NIDHI-PRAYAS 2.0** | Up to ₹10 L | Pre-startup prototype support via DST TBIs |
| **Pfizer INDovation (example corporate track)** | ~₹60 L + incubation | NCD focus programmes from pharma majors |

Prerequisites common to all: **MSME (Udyam) registration → DPIIT startup recognition → incubation**. All three are free/cheap and should be done immediately (see [doc 08](08-roadmap.md) Phase 2).

## Cost structure

- **Pilot-scale operating cost: ₹0/month** on free tiers (see [doc 09](09-deployment.md)); optional domain ~₹1,000/year.
- Meaningful costs only begin at scale: always-on backend (~₹600/month), paid DB tier (~₹1,500–3,000/month), and — if reminder reach demands it — WhatsApp Business API (~₹0.5–1/message) or a native push wrapper (FCM free).
- The genuinely scarce resources are pharmacist time (content authoring, counselling) and clinical validation — which is exactly what grant money is for.

## Revenue model (honest sequencing)

1. **Months 0–12: grants + prizes.** Hackathon prizes (₹2–5 L pools) and first grants. No revenue.
2. **Months 12–24: institutional SaaS.** 2–5 hospital/college pharmacy departments at ₹2,000–5,000/month each — funds operations while the dataset grows.
3. **Months 18–36: data studies.** De-identified RWE studies for pharma/CROs (₹5–50 L per study) once the consented dataset is large enough and ethics-governed.
4. **Months 24+: population programs.** Insurer / government NCD-program partnerships.

## What PMAS will not do

- Charge patients.
- Sell identifiable data — ever (see [doc 04](04-security-and-dpdp-compliance.md); Vault A is never monetised).
- Raise VC before clinical validation — grants and revenue first; dilution later if scaling demands it.

## Success metrics for the business (beyond the thesis)

| Horizon | Metric |
|---|---|
| 6 months | Grant/seed corpus secured; pilot running |
| 12 months | ≥50 patients through the platform; 1st publication submitted |
| 24 months | ≥3 paying pharmacy sites; first RWE study delivered |
| 36 months | Sustainable operating revenue; team of 3+; ABDM integration decision made |

Sources: MarketIntelo, Market Research Future, IMARC, DataIntelo market reports (2025–2026); Startup India / BIRAC / PRIP scheme pages. Figures are indicative market-research estimates.
