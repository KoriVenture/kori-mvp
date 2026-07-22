# Kori MVP — Architecture Decisions

## ADR summary

### Monorepo

The project uses pnpm workspaces and Turborepo.

### Frontend

The frontend uses Next.js App Router.

### Backend

Next.js route handlers provide the initial Backend-for-Frontend layer.

A separate backend service should not be introduced unless the MVP demonstrates a clear need.

### Shared UI

Shared UI components and global styles belong in `packages/ui`.

### Database

Supabase PostgreSQL is the application database.

### Storage

Supabase Storage holds milestone evidence and supporting documents.

### Authorization

Supabase Row Level Security is required for user-owned and role-specific data.

### Blockchain

Ethereum Sepolia is the MVP network.

### Smart contracts

Hardhat is used to compile, test and deploy Solidity contracts.

### Web3 client

Viem is the primary low-level Ethereum client.

Wagmi provides React wallet integration.

### Wallet

MetaMask is the first supported user wallet.

### Multisig

Safe provides the controlled approval workflow.

### Authentication

Supabase manages application authentication.

SIWE may be used to associate and verify Ethereum wallet ownership.

### AI

AI integrations must be provider-independent at the domain level.

Provider-specific clients belong in `packages/ai`.

### Observability

Pino provides structured application logging.

Sentry provides application error monitoring.

### Deferred tooling

The following tools are intentionally deferred:

- Storybook
- Husky
- lint-staged
- commitlint