≠rá^—f•ñÿ¶{]¨y 'v√Æ∂õ≠# AttireLens

A virtual try-on experience for Asian and Middle Eastern occasion wear and home wear.

AttireLens is designed for garments conventional virtual fitting rooms frequently handle poorly: sarees, lehengas, salwar kameez, kebaya, baju kurung, ao dai, hanbok, kimono, hanfu, qipao, chapan, manteau, abaya, thobe, kaftan, bisht and other embroidered, draped or layered clothing.

The complete capture, measurement, styling, layering, accessory, footwear and fit-review experience is designed equally for womenswear, menswear, unisex and gender-fluid wardrobes.

## Production baseline

- Online-shopping and in-store journeys
- Local user-photo and outfit-photo previews
- Session deletion without an account
- Clear separation between style visualization and physical fit
- Responsive, accessible product experience
- Multi-piece outfit composition and culturally relevant draping choices
- Spoken and written outfit descriptions
- Privacy receipts, detail-fidelity checks and text-only review notes

The deployed web experience is the production product surface. Image inputs currently remain in browser memory while the secure inference layer is integrated. The interface does not claim that its input-review composition is a completed AI try-on.

The production inference boundary is defined in [docs/PRODUCTION_ARCHITECTURE.md](docs/PRODUCTION_ARCHITECTURE.md). A release may be called production-ready only after its pose, silhouette, measurement, garment and try-on stages pass the quality and security gates in that document.

## Privacy promise

AttireLens is designed around data minimization:

- Session images are not persisted by the current web build.
- Customer photos are never training data by default.
- Every inference provider must contractually enforce zero retention.
- Photo contents must never enter logs, analytics, crash reports, or backups.
- Visual simulation must never be presented as proof of physical fit.

See [docs/PRODUCT.md](docs/PRODUCT.md) for the product scope and roadmap.

## Development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
npm run build
```

Built with React, TypeScript, vinext, and Cloudflare-compatible output.
