# Kori — exact Next.js migration

This project is a source-faithful App Router translation of the current
`KoriVenture/public_landing_page` repository.

## Fidelity rules

- Do not redesign.
- Do not change wording.
- Do not change section order.
- Do not change spacing, breakpoints, color values, font stacks or animation constants.
- Do not replace the original `kori.js` animation engine with another animation library.
- Do not use Next/Image for the current visual assets unless pixel parity has first been proven.
- Do not add Tailwind Preflight. Tailwind utilities are available, but the original Kori CSS remains authoritative.
- All handwritten CSS is consolidated in `src/app/globals.css`.

## Assets

Copy the **entire current** legacy `assets/` directory byte-for-byte to:

```text
public/assets/
```

Do not rename, recompress, resize or optimize the source images or SVG files.
The current design depends on exact files including:

- `landing-collage.webp`
- `how-kori-works-hero.png`
- `fadjiah-color-pencil.png`
- `ailiza-color-pencil.png`
- `lionel-color-pencil.png`
- `brice-color-pencil.png`
- `tunde-color-pencil.png`
- Kori logo/favicons
- every other file currently present in `assets/`

## Install

```bash
npm install
npm run dev
```

## Validate

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Stellar/Soroban reference

The Testnet deal-escrow contract, product requirements, deployment evidence and
developer guide live in [`packages/stellar-contracts`](./packages/stellar-contracts/README.md).
The root Next.js application does not yet call the contract; that application
and data integration is tracked as V1 Gate E in the
[`Stellar/Soroban PRD`](./packages/stellar-contracts/PRD.md).

Validate the contract independently from the application:

```bash
cd packages/stellar-contracts
cargo test --locked
cargo clippy --all-targets -- -D warnings
stellar contract build --locked --optimize
```

## Why internal links use normal anchors

The legacy Kori animation script is intentionally preserved unchanged.
Normal document navigation forces the same fresh DOM initialization the static
site had. Converting navigation to client-side transitions without also
rewriting the animation lifecycle would change behavior and risks duplicated or
stale observers/listeners.

That is intentionally avoided because visual and behavioral fidelity is the
priority.
