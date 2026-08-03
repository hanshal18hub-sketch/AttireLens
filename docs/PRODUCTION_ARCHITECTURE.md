­r‡^Ñf¥–Ø¦{O,yÊ'vÃ®¶›­# AttireLens production inference contract

AttireLens is a production-bound virtual dressing room for clothed users. No release may generate or claim a fit result unless every required stage completes and exposes its confidence and provenance.

## Required pipeline

1. **Input safety and quality** â€” accept clothed photos or a short turn video; reject nudity, unsupported media, corrupted files, missing full-body framing and unusable lighting. Strip metadata before inference.
2. **Multi-view validation** â€” identify front, right, back and left views; detect duplicates, camera tilt, occlusion and scale inconsistencies.
3. **Clothed-body pose detection** â€” produce versioned 2D/3D landmarks with per-joint confidence. Never infer hidden anatomy as fact.
4. **Silhouette segmentation** â€” separate person, current clothing, hair, footwear and background. Preserve hair, skin and identity boundaries.
5. **Scale calibration and body estimates** â€” require measured height or a calibrated reference. Return ranges, not false precision.
6. **Measurement confirmation** â€” show raw height, chest, waist, hip and inseam estimates for user correction and explicit confirmation.
7. **Garment ingestion** â€” extract the garment from an uploaded image or permitted retailer source; identify category, layers, drape, construction, stretch and available garment measurements.
8. **Cultural garment model** â€” retain saree pleats and pallu, dupatta placement, lehenga volume, kurta and sherwani structure, kebaya construction, kaftan and abaya drape, and other region-specific details without inventing hybrid garments.
9. **Fit analysis** â€” compare confirmed body ranges with garment dimensions, ease, stretch and construction. Return fit by body region with confidence and reasons.
10. **Try-on generation** â€” preserve identity, body proportions, pose, skin tone, hair and garment detail. Generation must be conditioned on the confirmed body profile and must not idealise the person.
11. **Multi-angle output** â€” create only views supported by captured person and garment evidence. Rotation controls must not pretend a single 2D image is a verified 360-degree reconstruction.
12. **Result audit** â€” expose model versions, input quality, confidence, measurement confirmation, garment provenance and any unsupported areas.

## Failure rules

- Fail closed when required evidence is missing; never invent a size, body measurement or garment detail.
- Clearly separate visual appearance, predicted fit and verified garment measurements.
- Wider uncertainty must be shown for loose clothing, limited angles, occlusion or missing scale.
- A generated image is never proof that a physical garment will fit.

## Privacy and security gates

- Zero-retention inference contracts and no customer media in logs, analytics, crash reports, backups or training data.
- Encryption in transit; ephemeral encrypted processing storage only when unavoidable; deterministic deletion with audit evidence.
- Strict media type, size and decompression limits; malware scanning; rate limits; abuse detection; signed short-lived access; SSRF-safe retailer import.
- No biometric identity matching. Pose and silhouette data are session-scoped and deleted with the session.
- Documented incident response, vendor review, threat modelling and independent security testing before public launch.

## Release gates

- Accuracy evaluation across skin tones, body shapes, mobility aids, modest clothing, womenswear, menswear and culturally specific garments.
- Defined thresholds for landmark confidence, segmentation IoU, measurement error and garment-detail preservation.
- Accessibility testing for keyboard, screen reader, zoom, reduced motion, contrast and plain-language errors.
- Human review of high-risk failures and a visible way to correct measurements or reject a result.
- Observability may record timings, error codes and model versions, but never customer images or derived body measurements.
