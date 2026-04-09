# Hover Claims — Automate the Estimate
## Product Requirements Document

**Author:** Yosef Durr
**Status:** Prototype / Interview exercise
**Last updated:** April 2026

---

## 1. Product Vision

Turn every Hover inspection into a carrier-ready repair scope in minutes — drafted by AI, trusted by adjusters, grounded in evidence.

## 2. Problem

Desk adjusters spend hours translating inspection evidence into Xactimate line items. The work is repetitive, inconsistent across adjusters, and the bottleneck between a completed inspection and an authorized repair. Adjusters don't need AI to replace them — they need it to do the first pass so they can spend their time on judgment, not transcription.

## 3. Business Value

- **Cycle time:** Reduce inspection-to-estimate time from hours to minutes (working assumption: 60–80% reduction on standard claims)
- **Consistency:** Compress estimate variance across adjusters and regions, which carriers care about for loss-ratio predictability
- **Capacity:** Let carriers handle more claims per adjuster without sacrificing quality — directly addresses the catastrophe-season surge problem
- **Defensibility:** Every Hover inspection becomes training data, creating a flywheel competitors without inspection volume can't match

## 4. Design Principles

1. **Evidence-first.** Every line item links back to the photo, measurement, or note that justifies it.
2. **Adjuster in control.** AI drafts. Humans decide. Always.
3. **Confidence is visible.** Adjusters see what the AI is sure about and what it isn't — no black boxes.
4. **Edits are cheap.** Modifying a line item should take one click, not five.
5. **Carrier-ready output.** Native Xactimate compatibility is non-negotiable.
6. **Speed is a feature.** If the adjuster can't complete a review faster than they could manually, nothing else matters.

## 5. Assumptions

- Hover inspection output includes photos with location tags, material measurements, structured checklist responses, and a 3D model
- The AI integrates with Xactimate via existing XactAnalysis pipes
- Target user is a desk adjuster (not field), reviewing 15–30 claims per day
- Initial scope is residential property claims (roof, siding, gutters) — not interior or contents

## 6. User Flow (Happy Path)

1. Adjuster opens claims dashboard
2. Clicks into a claim with "Draft Ready" status
3. Reviews claim summary and AI-drafted total
4. Enters the three-column review: line items, evidence, confidence panel
5. Clicks through line items, inspecting evidence and explanations
6. Edits items where needed (required reason codes)
7. Resolves exception items (low-confidence or missing data)
8. Continues to Final Review
9. Attests and submits to Xactimate

## 7. AI Behavior

### What the AI does
- Ingests inspection output: photos, measurements, 3D model, inspector notes, checklist responses
- Detects damage in photos and classifies type (hail, wind, impact, wear)
- Cross-references damage location with 3D model coordinates and material measurements
- Maps detected damage to Xactimate line items using carrier-specific guidelines
- Calculates quantities from measurements, applies pricing from regional databases
- Assigns a confidence score per line item
- Generates a plain-language explanation per recommendation

### Where AI hands off to human (non-negotiable)
- Any line item below 70% confidence
- Any damage type the AI hasn't been trained on
- Any claim where total estimate exceeds carrier-defined threshold
- Any final approval — AI never auto-submits

### AI behaviors intentionally avoided
- **No auto-submission to carrier.** Adjuster always commits.
- **No black-box scoring.** Every confidence score is decomposable into the evidence behind it.
- **No invented evidence.** If a measurement is missing, the AI says so.
- **No cross-claim training without consent.** Carriers will care about data isolation.

## 8. Tradeoffs

- **Depth over breadth.** Designed for residential exterior claims first, not contents or commercial. Easier to win, easier to measure, easier to expand from.
- **Adjuster-in-the-loop, not full automation.** A more aggressive design would auto-approve high-confidence claims. Held back because adjuster trust is the gating constraint and full auto would face regulatory and carrier resistance in year one.
- **Native Xactimate output, not a new system.** Carriers will not switch tools; the value is in feeding their existing pipes faster.

## 9. Risks

- **Hallucinated line items** — mitigated by evidence grounding
- **Overconfidence** — mitigated by transparent confidence scoring and required review thresholds
- **Compliance exposure** — mitigated by reason codes and attestation audit trail
- **Deskilling adjusters** — mitigated by keeping humans in decision loop; edits become training data

## 10. 90-Day Learning Plan

1. Shadow 5–10 desk adjusters doing manual scoping; measure where real friction lives
2. Run accuracy benchmark: AI draft vs. final approved estimate on historical claims, segmented by claim type and carrier. Metric: edit distance.
3. Pilot with one design-partner carrier on one claim type. Define kill criterion upfront (e.g., median time savings <40% or edit rate >60%).