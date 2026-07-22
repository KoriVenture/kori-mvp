# Kori MVP

Kori is a demonstration platform for milestone-based startup investment and controlled fund release. The intended product flow combines escrow-style funding, milestone evidence, advisory AI analysis, human review, and multisig approval.

> [!IMPORTANT]
> Kori is an early-stage MVP. It does **not** handle real funds, provide regulated investment services, or offer legal, financial, or investment advice.

## MVP purpose

The repository explores how an investor, a startup, and a fund manager could coordinate milestone-based funding while keeping the final release decision under human and multisig control. AI is intended to support evidence review only; it must never make the final financial decision.

## Current scope

The current repository provides the technical foundation for the MVP:

- a pnpm and Turborepo monorepo;
- a Next.js App Router application with an initial Kori landing screen;
- a shared UI package containing reusable components and global Tailwind CSS styles;
- internal package boundaries for domain, database, AI, Web3, observability, and shared configuration work;
- a Hardhat project containing the generated `Counter` sample contract and tests;
- baseline linting, typechecking, unit-test, browser-test, and formatting dependencies.

The end-to-end investment workflow is not implemented. The presence of a dependency or package scaffold does not mean its integration is complete.

## Intended MVP workflow

The target workflow is:

1. An investor deposits test funds.
2. Funds remain in an escrow contract.
3. A startup submits milestone evidence.
4. An AI service analyzes the submitted evidence as decision support.
5. A human reviews the evidence and analysis.
6. A Safe multisig approves the decision.
7. Funds are released or the request is rejected.

This workflow describes the product direction; it is not yet available end to end in the application.

## User roles

| Role         | Intended responsibilities                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------- |
| Investor     | Review opportunities, deposit test funds, track ownership, and review milestone progress.          |
| Startup      | Manage a project, define milestones, submit supporting evidence, and track decisions.              |
| Fund Manager | Review projects and evidence, use AI output as advisory information, and participate in approvals. |

Operations and compliance responsibilities may be introduced later, but they are outside the first application scope.

## Technology stack

| Area                  | Current repository technology                                                            |
| --------------------- | ---------------------------------------------------------------------------------------- |
| Workspace             | pnpm 10.33.0, pnpm workspaces, Turborepo 2                                               |
| Web application       | Next.js 16 App Router, React 19, TypeScript                                              |
| UI                    | Tailwind CSS 4, shadcn/ui components, Base UI, shared `@kori/ui` styles                  |
| Validation and forms  | Zod, React Hook Form                                                                     |
| Testing               | Vitest, Testing Library, Playwright dependency, Hardhat tests using `node:test` and Viem |
| Contracts             | Solidity 0.8.28, Hardhat 3, OpenZeppelin Contracts, Viem                                 |
| Integration scaffolds | Supabase JS, Wagmi, Safe SDK packages, SIWE, PDF.js, Pino, and Sentry                    |

Supabase, Wagmi, Safe, SIWE, AI-provider, Sentry, and Sepolia application integrations are not complete. The Hardhat configuration defines Sepolia connectivity, but the repository contains only a sample `Counter` contract and no Kori escrow deployment history.

## Monorepo structure

```text
apps/
  web/            Next.js application
  storybook/      Empty placeholder; Storybook setup is deferred

packages/
  ui/             Shared components, utilities, and global styles
  domain/         Domain package scaffold
  contracts/      Hardhat project and sample Counter contract
  web3/           Web3 and Safe dependency scaffold
  db/             Supabase dependency scaffold
  ai/             Document-analysis package scaffold
  observability/  Logging package scaffold
  config/         Shared TypeScript presets and configuration scaffold

docs/context/     Project context, architecture decisions, and status notes
```

Most internal packages currently expose package boundaries and dependencies but do not yet contain application implementation files. Shared global styles remain in `packages/ui/src/styles/globals.css` and are imported by `apps/web/app/globals.css`.

## Prerequisites

- Node.js compatible with the pinned Next.js 16 and Hardhat 3 toolchains. The repository does not currently declare a Node.js `engines` constraint.
- pnpm 10.33.0, as declared by the root `packageManager` field.
- Git for source control.

No external service account or environment variable is required to render the initial local web page.

## Installation

Run pnpm from the **repository root**. Do not install dependencies separately from `apps/web` or an individual package.

```bash
pnpm install
```

The root workspace includes `apps/*` and `packages/*`.

## Local development

Run all commands in this section from the **repository root**.

Start only the Next.js application:

```bash
pnpm --filter @kori/web dev
```

Then open [http://localhost:3000](http://localhost:3000).

The root development script currently starts every workspace package that defines a `dev` script:

```bash
pnpm dev
```

Build and run the web application in production mode:

```bash
pnpm --filter @kori/web build
pnpm --filter @kori/web start
```

## Build, typecheck, lint, and test

The root scripts delegate work to workspace packages through Turborepo:

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm test
```

Contract-specific commands are also available from the repository root:

```bash
pnpm --filter @kori/contracts compile
pnpm --filter @kori/contracts test
pnpm --filter @kori/contracts clean
```

Vitest scripts use `--passWithNoTests` in the packages where they are defined. Playwright is installed at the root, but no root Playwright script, configuration, or browser test suite is currently present.

## Environment variables

The initial Next.js screen does not read environment variables. No `.env.example` file is currently provided, and `.env*` files are ignored by Git.

The Hardhat configuration declares the following configuration-variable names for optional Sepolia work:

```text
SEPOLIA_RPC_URL
SEPOLIA_PRIVATE_KEY
```

These values are not required for local UI development. Never commit private keys, service credentials, wallet secrets, or real environment values. Prefer an approved secret store or Hardhat keystore when contract-network work is introduced.

Environment variables for Supabase, Safe, SIWE, AI providers, or Sentry are intentionally not documented yet because those integrations have not been implemented in the repository.

## Current implementation status

### Available now

- The pnpm workspace and Turborepo task graph are configured.
- The Next.js application starts and renders the initial Kori UI.
- Shared UI components and global Tailwind CSS styles are available through `@kori/ui`.
- The shared component runtime dependency and class-name utility required by the initial page are present.
- Internal package directories and dependency boundaries are scaffolded.
- Hardhat compile and test commands are defined for the generated sample project.
- Root build, lint, typecheck, and test orchestration scripts are defined.

### Not yet implemented

- Investor, startup, and fund-manager application flows.
- Supabase database clients, repositories, migrations, storage, authentication, and Row Level Security policies.
- Wallet connection, MetaMask flow, Wagmi clients, and SIWE authentication.
- Safe multisig transaction and approval workflows.
- A Kori escrow contract, production contract audit, or verified Sepolia deployment.
- AI-provider integration and milestone-document analysis.
- Pino and Sentry application wiring.
- End-to-end or Playwright browser tests.

## Deferred features and tooling

- Storybook remains deferred. `apps/storybook` contains placeholder directories but no package manifest, configuration, stories, or scripts.
- Husky, lint-staged, and commitlint appear in root development dependencies, but hooks and enforcement configuration have not been implemented.
- A separate backend service is not planned unless the MVP demonstrates a need beyond Next.js route handlers.

## Security and regulatory disclaimer

This repository is for demonstration and development purposes only.

- Do not use it to custody, transfer, or manage real funds.
- The sample contracts are not a production escrow implementation and have not been documented as audited.
- The project does not provide investment, legal, tax, compliance, or financial advice.
- AI output must remain advisory and must not authorize financial actions.
- Human review and explicit multisig approval are required parts of the intended design.
- Do not commit secrets, private keys, production credentials, or sensitive customer data.

## Documentation

- [Project context](docs/context/PROJECT_CONTEXT.md)
- [Architecture decisions](docs/context/ARCHITECTURE_DECISIONS.md)
- [Current status](docs/context/CURRENT_STATUS.md)
- [Changelog](CHANGELOG.md)
- [Hardhat sample package](packages/contracts/README.md)
- [Next.js documentation](https://nextjs.org/docs)
