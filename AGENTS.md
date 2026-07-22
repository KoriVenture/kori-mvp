# Kori MVP — Agent Instructions

## Project

Kori is a milestone-based private-market investment escrow demonstration platform.

Core workflow:

1. Investor deposits funds.
2. Funds remain in escrow.
3. A startup submits milestone evidence.
4. AI analyzes the submitted evidence.
5. A human reviews the analysis.
6. A Safe multisig approves the decision.
7. Funds are released or rejected.

The AI is consultative only and must never make the final financial decision.

## Repository

This repository is a pnpm and Turborepo monorepo.

```text
apps/
  web/            Next.js application

packages/
  ui/             Shared UI components and global styles
  domain/         Business types, schemas and rules
  contracts/      Solidity and Hardhat project
  web3/           Viem, wagmi, Safe and contract clients
  db/             Supabase clients and repositories
  ai/             AI integrations and document analysis
  observability/  Logging and monitoring
  config/         Shared TypeScript, ESLint and Prettier configuration