# Kori MVP — Current Status

## Verified foundation

- pnpm workspace and Turborepo task graph are configured.
- Next.js 16 builds the localized `/[locale]` route with static parameters for `/en`, `/fr`, and `/es`.
- `/` negotiates a supported browser language and redirects to an explicit locale prefix.
- Historical `.html` URLs redirect to their canonical locale-prefixed routes.
- English, French, and Spanish message catalogs have recursive namespace/key parity tests.
- Localized metadata, canonical paths, and language alternates are generated.
- Localized `robots.txt` and sitemap entries cover the public surface.
- The language switcher preserves the current pathname and query string.
- The theme switcher supports system, light, and dark preferences through next-themes.
- Kori source colors, semantic themes, font roles, responsive spacing, focus, and reduced-motion rules live in `packages/ui`.
- Shared Kori primitives and patterns include Button, Card, Badge, StatusBadge, Progress, Sheet, KoriLogo, Panel, Tag, StatCard, and MilestoneBar.
- The two validated transparent Kori lockups are present in `apps/web/public/brand`.
- Vitest and Testing Library cover locale contracts, messages, proxy behavior, shared styles, and variants.
- The eleven-block landing page, Stories page, map-less Capital Map, all 16 role-dashboard views, and simulator are implemented for all three locales.
- Business statuses remain stable codes and are translated at the application boundary.
- Local `MockUSDC` and `KoriEscrow` contracts and tests are present in `packages/contracts`.

## Running locally

Run from the repository root:

```bash
pnpm install
pnpm --filter @kori/web dev
```

Open:

```text
http://localhost:3000/
http://localhost:3000/en
http://localhost:3000/fr
http://localhost:3000/es
```

## Validation commands

```bash
pnpm --filter @kori/i18n test
pnpm --filter @kori/i18n typecheck
pnpm --filter @kori/ui typecheck
pnpm --filter @kori/web test
pnpm --filter @kori/web typecheck
pnpm --filter @kori/web build
```

The first web build may require network access for the three Google font families.

After a clean install, root `pnpm typecheck` and `pnpm test` currently stop in `@kori/observability` because that scaffold declares `tsc` and `vitest` scripts without declaring those development dependencies. This frontend reconstruction does not alter the unrelated observability package; the focused i18n/UI/web checks remain the validation boundary.

## Deferred

- Supabase database, storage, authentication, and RLS.
- Wallet connection, MetaMask, Wagmi, and SIWE.
- Web-application integration with `MockUSDC` and `KoriEscrow`.
- Safe transaction proposal and execution.
- AI-provider and evidence-analysis implementation.
- Pino and Sentry wiring.
- Storybook and CI enforcement.
- Audited production contracts and deployment history.

## Immediate development goal

Review the reconstructed frontend against client/designer feedback, then select the first separately authorized integration seam without weakening its local-demo disclosures.

Supabase, authentication, Web3, Safe application wiring, and AI-provider work remain outside the completed frontend reconstruction and require explicit scope.
