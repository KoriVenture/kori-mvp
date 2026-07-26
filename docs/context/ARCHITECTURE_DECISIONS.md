# Kori MVP — Architecture Decisions

## ADR summary

### Monorepo

The project uses pnpm workspaces and Turborepo. All pnpm commands run from the repository root.

### Frontend

The frontend uses Next.js 16 App Router. Next.js route handlers are the intended initial Backend-for-Frontend layer; a separate backend service should not be introduced unless the MVP demonstrates a clear need.

### Internationalization

Supported interface locales are `en`, `fr`, and `es`, with provisional default `en`. Public application URLs always use an explicit locale prefix.

`packages/i18n` owns framework-independent locale metadata and formatting definitions. `apps/web` owns next-intl routing, request configuration, messages, metadata, and interactive locale navigation. API routes remain locale-independent.

Language is separate from country, jurisdiction, currency, token, and time zone. Persisted statuses use stable codes and are translated only at the UI boundary.

### Shared UI

Shared components, Kori variants, and global styles belong in `packages/ui`. `apps/web/app/globals.css` remains an import-only bridge.

The component strategy is:

1. shadcn/Base UI for accessible primitives;
2. CVA-powered Kori variants and patterns in `packages/ui`;
3. localized, product-aware compositions in `apps/web`.

Generic shared components do not import next-intl.

### Visual source of truth

The historical prototype is a visual/workflow reference, not an architecture to copy. At historical revision `main@f95f986`, root HTML has priority for structure/copy/data, runtime CSS and embedded page CSS for visual values, runtime JavaScript for behavior, and validated lockups for brand assets. `ANALYSE_COMPLETE_KORI_NEXTJS.md` is a secondary audited mapping. The referenced `AUDIT_UI_UX_KORI.md` was absent from the inspected checkout and is not treated as verified evidence.

Audited colors are preserved as immutable source tokens. Semantic light/dark tokens may make documented accessibility adjustments. Raw historical colors do not belong in React components.

### Theme and typography

`next-themes` is the only theme-state system. Cormorant Garamond is editorial, Jost is interface, Carlito is body, and a system monospace stack is reserved for financial/technical data.

### Database and storage

Supabase PostgreSQL, private Supabase Storage, and Row Level Security remain the intended application-data architecture. Their clients, schemas, migrations, storage policies, authentication, and RLS rules are deferred.

### Blockchain and contracts

Ethereum Sepolia remains the intended MVP network. Hardhat compiles and tests Solidity; Viem is the primary low-level client and Wagmi is intended for React wallet integration.

The repository contains local `MockUSDC` and `KoriEscrow` implementations and tests. This does not imply a production audit, application integration, or verified deployment.

### Wallet, multisig, and authentication

MetaMask is the intended first wallet. Safe provides controlled approval and is a governance caller, not a fund recipient. Deposited test tokens remain in escrow until authorized release to the startup.

Supabase authentication and optional SIWE wallet association are deferred.

### AI

AI integrations must remain provider-independent at the domain level. Provider-specific clients belong in `packages/ai`. AI never signs, approves milestones, calls release, or holds private keys.

### Observability

Pino is intended for structured logging and Sentry for error monitoring. Application wiring is deferred.

### Deferred tooling

Browser automation and local Git hooks are not configured. Storybook and CI enforcement remain deferred.

### Frontend demonstration boundaries

The complete localized public surface, role-dashboard routes, and simulator are presentational demonstrations. Canonical numeric fixtures are shared across locales; editorial copy and stable status codes are translated at the application boundary. Demo dialogs and simulator transitions may update local memory only. No frontend action may claim persistence, contract deployment, signature, custody, or a remote transaction.

## Buildathon flow decision — 2026-07-23

The buildathon demonstration uses one default deal, one startup, one milestone, and one full release. Legal structure, real KYC/KYB, fiat custody, SPV execution, on/off-ramp providers, CCTP, and production ownership records remain post-MVP workstreams.

The UI must tell the complete investor-to-payout story without weakening the human and multisig control model.
