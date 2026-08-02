# Kori MVP — Agent Instructions

## Project

Kori is a milestone-based private-market investment escrow demonstration platform.

Core workflow:

1. An investor deposits funds.
2. Funds remain in escrow.
3. A startup submits milestone evidence.
4. AI analyzes the evidence as decision support.
5. A human reviews the evidence and analysis.
6. A Safe multisig approves the decision.
7. Funds are released or the request is rejected.

AI is consultative only and must never make the final financial decision. The MVP must never imply that it handles real funds or provides investment, legal, tax, compliance, or financial advice.

## Repository

This repository is a pnpm and Turborepo monorepo.

```text
apps/
  web/            Next.js application

packages/
  ui/             Shared UI components and global styles
  i18n/           Framework-independent locale and formatting definitions
  domain/         Business types, schemas and rules
  contracts/      Solidity and Hardhat project
  web3/           Viem, wagmi, Safe and contract clients
  db/             Supabase clients and repositories
  ai/             AI integrations and document analysis
  observability/  Logging and monitoring
  config/         Shared TypeScript, ESLint and Prettier configuration
```

Run every pnpm command from the repository root. Do not create package-local lockfiles or install dependencies from an individual workspace.

## Internationalization

- Supported interface locales are exactly `en`, `fr`, and `es`; the provisional default is `en`.
- Public application URLs always use a locale prefix.
- `packages/i18n` must remain independent of React, Next.js, and `next-intl`.
- Next.js routing, message loading, metadata, and interactive language controls belong to `apps/web`.
- Generic `packages/ui` components must not import `next-intl`.
- Language does not imply country, currency, time zone, or blockchain token. Keep those values explicit.
- Stable domain and API status codes remain language-independent; translate their labels at the application boundary.

## UI architecture

- Shared global styles remain in `packages/ui/src/styles/globals.css`.
- `apps/web/app/globals.css` remains an import-only bridge to `@kori/ui/globals.css`.
- Use semantic Kori tokens in components; do not scatter historical hex colors through React files.
- Compose accessible shadcn/Base UI primitives, Tailwind layout, CVA variants, Lucide generic icons, and the existing `next-themes` provider.
- Preserve visible focus states, reduced-motion behavior, semantic headings, and layouts that tolerate translated copy.
- Treat `../Kori/AUDIT_UI_UX_KORI.md` at `main@f95f986`, the historical production CSS, and validated logo files as read-only visual references.

## Deferred work

The localized marketing pages, all three role-dashboard route sets, and the pedagogical simulator are implemented as local demonstrations. They use static fixtures and in-memory interactions only.

Do not infer integration completion from those screens, installed dependencies, or package scaffolds. Unless a task explicitly expands scope, Supabase, authentication, wallet connection, SIWE, Safe application wiring, AI-provider wiring, real transaction execution, Storybook, and production deployment remain deferred.
