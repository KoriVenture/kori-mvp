# Kori MVP

Kori is a demonstration platform for milestone-based private-market investment escrow. It explores how an investor, a startup, and a fund manager could coordinate funding, milestone evidence, advisory AI analysis, human review, and controlled multisig release.

> [!IMPORTANT]
> Kori is an early-stage, non-production MVP. It does **not** handle real funds, provide regulated investment services, or offer legal, tax, compliance, financial, or investment advice.

## MVP purpose and scope

The intended workflow is:

1. An investor deposits test funds.
2. Funds remain locked in escrow.
3. A startup submits the hash of a canonical source-evidence manifest.
4. AI may analyze that exact manifest version as decision support.
5. A human records a separate decision for the same hash and version.
6. A weighted Stellar release authority approves the exact payout.
7. Funds are released after approval, or become refundable at the deadline if
   release never occurs.

AI must remain advisory and must never sign transactions, approve milestones, or make the final financial decision. AI reviews and human decisions reference the confirmed manifest hash/version and are never included in the manifest hash preimage.

An unavailable AI provider must not block human review, deadline progression,
or refunds.

The repository currently implements the multilingual frontend demonstration,
retains a historical local Hardhat phase, and includes the active Soroban
contract package with verified Testnet evidence. The Next.js application is not
yet connected to the Stellar contract or to an AI provider.

## Available now

- Complete locale-prefixed English, French, and Spanish public routes: `/en`, `/fr`, `/es`, Stories, and Capital Map.
- Browser-language negotiation from `/`, with English as the fallback.
- Historical `.html` redirects that preserve the selected or negotiated locale.
- Addressable Fund Manager, Angel Investor, and Startup Founder dashboards with 16 implemented views.
- A pedagogical, in-memory milestone-release simulator that never deploys a contract or transfers funds.
- Localized metadata, canonical paths, language alternates, `robots.txt`, and `sitemap.xml`.
- Accessible language, system/light/dark theme, mobile Sheet navigation, dialogs, file inputs, focus states, and reduced-motion behavior.
- Audit-derived Kori light/dark tokens, typography, responsive spacing, brand assets, shared component variants, and reusable Kori patterns.
- Framework-independent locale and formatting definitions in `@kori/i18n`.
- `MockUSDC` and `KoriEscrow` contracts with local Hardhat tests.
- Stellar/Soroban `DealEscrow` contract, tests, deployment manifest, and
  Testnet assurance report in `packages/stellar-contracts`.
- Package boundaries for future domain, database, AI, Web3, observability, and shared configuration work.

Every frontend financial value and transaction record is demonstration data. Actions either update local in-memory state or are explicitly disabled; no real funds are handled.

## User roles

| Role         | Intended responsibility                                                                   |
| ------------ | ----------------------------------------------------------------------------------------- |
| Investor     | Review opportunities, deposit test funds, and follow milestone progress.                  |
| Startup      | Manage a project, submit milestone evidence, and follow decisions.                        |
| Fund Manager | Review projects and evidence, use AI output as advice, and participate in human approval. |

Operations and compliance responsibilities are outside the first application scope.

## Technology stack

| Area                  | Current technology                                                    |
| --------------------- | --------------------------------------------------------------------- |
| Workspace             | pnpm 10.33.0, pnpm workspaces, Turborepo 2                            |
| Web                   | Next.js 16 App Router, React 19, TypeScript                           |
| Internationalization  | next-intl 4, `@kori/i18n`, namespaced JSON messages                   |
| UI                    | Tailwind CSS 4, shadcn/Base UI, CVA, Lucide, next-themes              |
| Forms and validation  | React Hook Form and Zod dependencies; application forms are deferred  |
| Testing               | Vitest, Testing Library, Soroban host tests, Hardhat historical tests |
| Contracts             | Soroban/Rust active reference; Solidity/Hardhat historical reference  |
| Integration scaffolds | Supabase JS, Wagmi, Safe SDK packages, SIWE, Pino, and Sentry         |

Installed dependencies and package directories do not imply completed integrations.

## Monorepo structure

```text
apps/
  web/            Localized Next.js application
  storybook/      Empty placeholder; setup is deferred

packages/
  ui/             Shared components, Kori variants, and global styles
  i18n/           Framework-independent locales and formatting options
  domain/         Domain package scaffold
  contracts/      Hardhat project, MockUSDC, KoriEscrow, and tests
  stellar-contracts/ Active Soroban contract, PRD, tests, and Testnet evidence
  web3/           Web3 and Safe dependency scaffold
  db/             Supabase dependency scaffold
  ai/             AI/document-analysis package scaffold
  observability/  Logging package scaffold
  config/         Shared TypeScript configuration

docs/
  architecture/   UI, internationalization, and audit decisions
  context/        Project context, decisions, and current status
```

Shared global styles are owned by `packages/ui/src/styles/globals.css`. `apps/web/app/globals.css` is only the application import bridge.

## Prerequisites

- A Node.js version compatible with Next.js 16 and Hardhat 3. The repository does not currently declare an `engines` constraint.
- pnpm 10.33.0, as pinned in the root `packageManager` field.
- Git.
- Network access during the first production build so `next/font` can retrieve Cormorant Garamond, Jost, and Carlito.

## Installation

Run pnpm from the **repository root only**. Do not install from `apps/web` or an individual package.

```bash
pnpm install
```

No external service account is required for the localized UI.

## Local development

Run every command below from the **repository root**.

```bash
pnpm --filter @kori/web dev
```

Open [http://localhost:3000](http://localhost:3000). The root negotiates a supported language and redirects to one of:

- [http://localhost:3000/en](http://localhost:3000/en)
- [http://localhost:3000/fr](http://localhost:3000/fr)
- [http://localhost:3000/es](http://localhost:3000/es)

Representative routes:

```text
/en/stories
/fr/capital-map
/es/dashboard/fund-manager/pipeline
/en/dashboard/angel-investor/portfolio
/fr/dashboard/startup-founder/milestones
/es/simulator
```

The root command `pnpm dev` runs every workspace that defines a `dev` script.

## Build, typecheck, lint, and test

Workspace-wide checks:

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm test
```

Known repository inconsistency: the current `@kori/observability` scaffold declares `typecheck` and `test` scripts without declaring TypeScript or Vitest. Consequently, root `pnpm typecheck` and `pnpm test` stop in that package after a clean install. The focused frontend commands below are the authoritative checks for this reconstruction; resolving the unrelated scaffold manifest requires separate scope.

Focused web and shared-package checks:

```bash
pnpm --filter @kori/web build
pnpm --filter @kori/web typecheck
pnpm --filter @kori/web test
pnpm --filter @kori/ui typecheck
pnpm --filter @kori/i18n typecheck
pnpm --filter @kori/i18n test
```

Active Soroban contract checks:

```bash
cd packages/stellar-contracts
cargo test --locked
cargo clippy --all-targets -- -D warnings
stellar contract build --locked --optimize
```

Historical EVM contract checks:

```bash
pnpm --filter @kori/contracts compile
pnpm --filter @kori/contracts test
pnpm --filter @kori/contracts clean
```

## Environment variables

The localized UI does not require environment variables. No `.env.example` is currently provided.

The historical Hardhat configuration defines optional Sepolia
configuration-variable names:

```text
SEPOLIA_RPC_URL
SEPOLIA_PRIVATE_KEY
```

They are not required for local UI or contract tests. Never commit private keys, wallet secrets, API tokens, service credentials, or real environment values.

Environment variables for Supabase, Stellar application wiring, AI providers,
and Sentry are intentionally not documented because those integrations are not
implemented.

## Frontend source of truth

The reconstruction follows this order:

1. historical root HTML for structure, content, data, links, and interactions;
2. historical runtime CSS and page-embedded CSS for visual values;
3. historical runtime JavaScript for behavior;
4. validated Kori SVG assets;
5. the audited historical analysis and UI/UX audit.

The historical repository at `../Kori` and its audited revision `main@f95f986` are read-only references. Accessibility and routing defects are corrected and documented rather than copied.

## Current implementation status

The multilingual public pages, all canonical role-dashboard routes, the
simulator, shared Kori design system, theme state, route negotiation, metadata,
historical redirects, and unit/component tests are present. The Soroban core is
implemented and independently exercised on Testnet; the frontend remains a
local, static/in-memory demonstration and is not wired to that deployment.

The following remain deferred:

- Supabase clients, repositories, migrations, storage, authentication, and RLS;
- Stellar wallet/client signing and weighted release-account application flows;
- connection between the Next.js application and the active Soroban contract;
- AI-provider integration and evidence analysis;
- Sentry and Pino application wiring;
- Storybook and CI enforcement;
- audited production contracts or verified deployment history.

## Security and regulatory disclaimer

- Do not use this repository to custody, transfer, or manage real funds.
- The contracts and UI are demonstrations and are not presented as production-audited systems.
- The project does not provide investment, legal, tax, compliance, or financial advice.
- AI output must remain advisory and must not authorize financial actions.
- Human review and explicit multisig approval remain mandatory product principles.
- Do not commit secrets, private keys, production credentials, personal data, or sensitive documents.

## Documentation

- [Project context](docs/context/PROJECT_CONTEXT.md)
- [Architecture decisions](docs/context/ARCHITECTURE_DECISIONS.md)
- [Current status](docs/context/CURRENT_STATUS.md)
- [Internationalization architecture](docs/architecture/internationalization.md)
- [Architecture index](docs/architecture/README.md)
- [Technology baseline](docs/architecture/technology-baseline.md)
- [UI migration strategy](docs/architecture/ui-migration-strategy.md)
- [UI component strategy](docs/architecture/ui-component-strategy.md)
- [Kori design system](docs/architecture/design-system.md)
- [Historical UI source map](docs/architecture/historical-ui-source-map.md)
- [Audit fidelity matrix](docs/architecture/audit-fidelity-matrix.md)
- [Changelog](CHANGELOG.md)
- [Contract package](packages/contracts/README.md)
- [Stellar/Soroban contract package](packages/stellar-contracts/README.md)
- [Stellar/Soroban PRD](packages/stellar-contracts/PRD.md)
