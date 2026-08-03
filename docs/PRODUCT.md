≠rá^—f•ñÿ¶{^ly 'v√Æ∂õ≠# AttireLens product brief

## Vision

AttireLens lets shoppers see themselves in Asian and Middle Eastern occasion wear and home wear without turning their body images into a permanent data asset. It specializes in culturally specific, embroidered, draped and layered garments that generic virtual try-on systems frequently represent poorly.

AttireLens applies the same capture, measurement, styling, layering, accessory, footwear and fit capabilities to womenswear, menswear, unisex and gender-fluid looks. Gender must never reduce the available feature set or determine body-shape assumptions.

## Core user

A shopper choosing clothing for weddings, festivals, religious occasions, family events or daily home wear‚Äîespecially when buying remotely, coordinating multiple pieces, ordering custom tailoring, or judging a garment from photographs shared by a boutique or family member.

## Product principles

1. **Cultural garment fidelity:** preserve embroidery, borders, prints, draping, layers and the relationships between coordinated pieces.
2. **Universal input:** accept a photograph, product image, product page, store camera capture, or retailer QR code.
3. **Privacy by architecture:** minimize collection, avoid accounts for basic use, process locally where practical, and make deletion immediate.
4. **Honest confidence:** distinguish a visual styling preview from measurement-based physical fit.
5. **Body-respectful guidance:** describe colour, proportion, and styling choices without ranking or shaming bodies.
6. **Identity fidelity:** preserve the customer‚Äôs face, skin tone, hair, body shape, and chosen presentation.

## MVP

- Upload one clear person photo.
- Upload or capture a front-facing garment or coordinated set, including optional dupatta, scarf, shawl or outer layer.
- Create a realistic try-on image while retaining garment details.
- Show colour-harmony and styling guidance as optional suggestions.
- Download locally or delete the session.
- Require no account and retain no media.

## Privacy threat model

‚ÄúNothing is stored‚Äù means no persistent storage. Processing still requires transient bytes in device or server memory.

- Strip EXIF metadata before inference.
- Prefer on-device segmentation, pose extraction, and measurement estimation.
- Use encrypted transport only for work that cannot happen on-device.
- Configure inference with zero data retention and no provider training.
- Keep image bytes and derived biometric geometry out of logs and telemetry.
- Hold transient server inputs in memory with strict timeouts and immediate disposal.
- Do not cache inference requests or generated images.
- Provide one-tap session deletion and clear retention language.
- Commission privacy and security reviews before public launch.

## Production workstreams

### Workstream 1 ‚Äî Production experience foundation

Deliver the capture, measurement, styling, trust, online-shopping and in-store product surfaces against production accessibility, privacy and failure-state requirements. This repository implements that foundation.

### Workstream 2 ‚Äî Visual try-on inference

Integrate a zero-retention virtual try-on model. Evaluate identity preservation, embroidery and print fidelity, layered garments, diverse skin tones and body types, and output latency.

### Workstream 3 ‚Äî Fit intelligence

Add optional measurements, brand garment charts, fabric stretch and drape metadata, fit preference, confidence ranges, and explicit uncertainty. Never infer exact fit from a generated picture alone.

### Workstream 4 ‚Äî Shopping surfaces

Add product-link ingestion, a browser extension, retailer QR codes, wardrobe combinations, comparison, and private sharing.

## Initial success measures

- Percentage of sessions that reach a generated preview
- Preview usefulness rating
- Purchase-confidence change after use
- Percentage of users who understand the fit disclaimer
- Median generation time
- Identity and garment fidelity across audited demographic groups
- Zero retained customer-image incidents

## First differentiator release

- Multi-piece garment composition with independent main garment, draped layer and accessory inputs
- Draping choices that adapt to the selected cultural context
- Written and spoken outfit descriptions for blind and low-vision shoppers
- A session privacy receipt showing processing, providers, storage and training use
- Source-detail fidelity checks that separate known facts from AI uncertainty
- Privacy-safe, text-only review notes while encrypted expiring image sharing is developed

The regional taxonomy is a navigation aid, not a claim that cultures or garments are interchangeable. Garment names, draping practices and recommendations must be reviewed with people from the communities represented.
