# AttireLens

A privacy-first virtual try-on experience for occasion wear and home wear across South, Southeast, East, Central and West Asia, Iran, Iraq and the wider Middle East.

AttireLens is designed for garments conventional virtual fitting rooms frequently handle poorly: sarees, lehengas, salwar kameez, kebaya, baju kurung, ao dai, hanbok, kimono, hanfu, qipao, chapan, manteau, abaya, thobe, kaftan, bisht and other embroidered, draped or layered clothing.

## What works today

- Online-shopping and in-store journeys
- Local user-photo and outfit-photo previews
- Session deletion without an account
- Clear separation between style visualization and physical fit
- Responsive, accessible product experience
- Multi-piece outfit composition and culturally relevant draping choices
- Spoken and written outfit descriptions
- Privacy receipts, detail-fidelity checks and text-only review notes

The current MVP keeps selected images in browser memory and has no upload endpoint, database, accounts, or analytics. Its result screen is intentionally labelled a concept preview; culturally accurate AI garment transfer is the next model-integration milestone.

## Privacy promise

AttireLens is designed around data minimization:

- Images are not persisted by the current prototype.
- Customer photos are never training data by default.
- A future inference provider must contractually support zero retention.
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
