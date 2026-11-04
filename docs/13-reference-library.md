# 13 — Reference Library

External repositories reviewed while building PMAS, kept here so the reasoning is not lost. For each
one: what it is, what we took from it, and what we deliberately did not.

**How to use this page.** Before adopting a tool or pattern from outside, check here first — the
verdict may already exist. Nothing in this list is installed in the PMAS repository; these are
references, not dependencies.

---

## 1. `liquidslr/system-design-notes`

**What it is.** Notes summarising Alex Xu's *System Design Interview* (Vol 1 & 2) — 28 chapters
covering scaling, rate limiters, consistent hashing, key-value stores, notification systems, and
large-scale designs.

**What we took.**
- **Rate limiter (ch. 4)** — the algorithm families behind the throttling we implement (fixed vs
  sliding window, token bucket). Useful background for `throttle_states` and the per-source limit.
- **Notification system (ch. 10)** — delivery channels, scheduling, opt-out and retry thinking, which
  informs the reminder architecture.

**What we did not take.** The rest is interview-scale: consistent hashing, quorums, sharding,
Snowflake IDs. PMAS runs at departmental scale and adopting those would be over-engineering.

**Verdict:** reference for specific chapters only.

---

## 2. `multica-ai/andrej-karpathy-skills`

**What it is.** Four working principles for AI coding agents, derived from Andrej Karpathy's
observations about how LLMs write code badly. MIT, tiny, no dependencies.

**What we took — adopted as working discipline.**
- **Think before coding** — state assumptions, surface trade-offs, stop when unclear.
- **Simplicity first** — minimum code, no speculative abstraction.
- **Surgical changes** — touch only what the task requires; clean up only your own orphans.
- **Goal-driven execution** — turn "fix the bug" into "write a failing test, then make it pass".

**Note.** The third principle is the one most easily broken: an early consent-screen edit reached past
its task and broke the surrounding DOM. That failure is why verification now includes structural
checks, not just "does it load".

**Verdict:** adopted as process, not as a dependency.

---

## 3. `ajsahni/agents-office`

**What it is.** A local 3D "office" where AI agents across departments work on your Claude login, with
a notes "brain", MCP connector governance, routines and approval gates.

**What we took — concepts only.**
- **Approval gate** — anything outbound waits for a human "OK". Mirrors the "decision support, not
  decision-making" rule and the reminder-versus-education boundary.
- **Role-scoped access** — each department gets only the connectors it needs. Mirrors least privilege
  in the permission matrix and break-glass design.

**What we did not take.** No code, assets or structure. The licence is PolyForm Noncommercial plus
additional terms (no resale, no rebranding, no bundling into another system), so nothing from it may be
reused in PMAS.

**Verdict:** concept reference only — restrictive licence, not reusable.

---

## 4. `cloudflare/security-audit-skill`

**What it is.** A six-phase, source-first security audit workflow for coding agents: reconnaissance →
coverage-led hunting → candidate validation → structured output → independent record verification →
target-neutral reporting, with JSON-schema validators for findings and coverage.

**What we took — adopted and executed.**
- Ran the full six-phase audit against a pinned commit, producing confirmed findings, a coverage
  ledger, and a remediation plan.
- Adopted its evidence discipline: a finding needs a named principal, a crossed boundary and a
  concrete result; a fresh verifier is told to **disprove** each finding; `needs_validation` is used
  when the decisive fact sits outside the repository rather than guessing.
- Several of its attack classes mapped directly onto real PMAS surfaces: web protocol and auth,
  client-side, data isolation and lifecycle (DPDP obligations), cloud and deployment, resource
  exhaustion, supply chain.

**What we did not take.** Live probing of the deployed service — the workflow is designed for local,
sandboxed evidence only, which matches how PMAS is verified.

**Verdict:** adopted as methodology; produced the audit report and remediation plan.

---

## 5. `garrytan/gstack`

**What it is.** An MIT-licensed "virtual engineering team" for coding agents: roughly seventy
slash-command skills that make an agent act as a product CEO, engineering manager, designer, code
reviewer, QA lead driving a real browser, security officer running OWASP + STRIDE, and release
engineer. Large (~5,000 files) and requires a local agent runtime plus Bun.

**What we took — workflow validation only.**
- The **role separation** idea: review a plan as a product owner, an engineer, a designer and a
  security reviewer separately, because each catches a different class of failure.
- The **release gate** idea: nothing ships without tests, review and a security check — which PMAS
  already enforces through CI, the audit, and verify-before-merge.

**What we did not take.** Nothing is installed. It assumes a local agent setup PMAS does not use, its
surface is large (hooks, auto-update, team-mode edits), and its bias is shipping velocity — the wrong
default for a clinical-adjacent tool where caution matters more than speed.

**Verdict:** reference for workflow discipline; not a dependency.

---

## What this library changed in PMAS

| Practice now in the repo | Source of the idea |
|---|---|
| Per-source rate limiting and constant-cost login | system-design-notes (rate limiter) |
| Reminder architecture thinking (delivery, opt-out, retry) | system-design-notes (notification system) |
| Verify-before-merge, surgical diffs, test-first fixes | andrej-karpathy-skills |
| Approval-gate and least-privilege framing | agents-office (concept) |
| Six-phase audit, independent verification, `needs_validation` discipline | cloudflare/security-audit-skill |
| Role-separated review and a release gate | gstack |

## What we deliberately avoid

- **Installing agent frameworks into this repository.** References stay outside; the repo carries only
  the product.
- **Interview-scale architecture.** Consistent hashing, sharding and distributed ID schemes are not
  justified at departmental scale.
- **Velocity-first defaults.** Shipping speed is subordinate to safety review, reviewed clinical
  content, and ethics approval.

---

*Internal reference notes. Not product documentation, and not a statement of endorsement by any of the
projects listed.*
