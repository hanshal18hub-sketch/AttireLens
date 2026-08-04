≠rá^—f•ñÿ¶{^ly 'v√Æ∂õ≠# AttireLens Fit Lab protocol

The Fit Lab is an internal evaluation environment. It is not a customer try-on surface and no result may be represented as production inference.

## Provenance states

- `simulated`: deterministic data used only to verify workflow and evaluation plumbing.
- `model-predicted`: output produced by a named, versioned model.
- `user-confirmed`: a participant reviewed or corrected a value.
- `physically-verified`: ground truth collected using the approved measurement protocol.

Every request and response must declare `environment: test` and `testOnly: true`. The backend rejects undeclared prediction sources and unauthenticated requests.

## First feasibility cohort

- Eight to twelve consenting adults selected for varied height, body proportions, skin tone, presentation, hair or head covering, mobility and capture device.
- Use anonymous case IDs. Keep identity and consent records outside the evaluation record.
- Testing consent and model-training consent are separate. Training is opt-in only.
- No nude or underwear-only media.
- Participants may withdraw at any time and must receive deletion confirmation.

## Case procedure

1. Record consent and anonymous case ID.
2. Capture known height, four clothed views or one turn video, and physically verified chest, waist, hip and inseam.
3. Record the prediction and its confidence range before viewing the comparison.
4. Record garment dimensions, fabric stretch, construction and physical fit.
5. Lock the predicted regional fit before revealing the worn-garment result.
6. Run the backend evaluator and export the test record.
7. Delete media and intermediate artifacts at the declared deadline.

## Initial gates

- Mean absolute measurement error at or below 4 cm for a feasibility case.
- Ground truth contained within at least 75% of reported ranges for the single-case evaluator; cohort target is at least 90% after calibration.
- Fit classification agreement for the tested region.
- Poor or incomplete evidence must result in `unknown`, not a confident guess.

These gates are research thresholds, not customer claims. They must be revised using cohort evidence before model selection.
