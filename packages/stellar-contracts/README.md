# Kori Stellar Contracts

Soroban V1 for one deal per contract, one milestone and one exact USDC release. It
implements the on-chain core of the current [Stellar architecture](https://www.figma.com/board/FlcuMidYV5TAuMDfBc8l6o/Kori-Stellar-Architecture-%E2%80%94-Custody--Governance-and-Data).
See the [Stellar/Soroban PRD](./PRD.md) for the complete target, current gaps and
build order.

For fast AI-assisted or nontechnical exploration, start with
the [Kori Blockchain Copilot Space](https://github.com/copilot/spaces/KoriVenture/2)
or [`AI_CONTEXT.md`](./AI_CONTEXT.md) locally. The reproducible Space source list
and instructions are in
[`COPILOT_SPACE_SETUP.md`](./COPILOT_SPACE_SETUP.md); the FigJam-to-code mapping
is in [`FIGMA_REFERENCE.md`](./FIGMA_REFERENCE.md).

## Current flow

1. An investor authenticates `fund`; the pinned official Testnet USDC SAC
   transfers assets into DealEscrow.
2. The exact target closes funding; the browser builds a canonical
   source-evidence manifest and the startup submits its hash.
3. The Fund Manager/Lead Investor reviews that exact exported manifest and
   approves its confirmed hash/version.
4. A weighted account requires the Investor Representative plus either the Lead
   or Kori Release Officer to authorize the exact payout.
5. If a deadline expires, anyone may trigger per-investor refunds to the
   original addresses; the caller cannot redirect funds.

Evidence documents and human decision reasons remain off-chain. The contract
stores only the source-manifest digest and its version. AI advisory is not
implemented in the V1 demo.

## Prerequisites

- Rust and Cargo
- `wasm32v1-none` Rust target
- Stellar CLI for Testnet deployment
- Docker only for a full local Quickstart network

## Getting started

```bash
cd packages/stellar-contracts

rustup target add wasm32v1-none
cargo test --locked
cargo clippy --all-targets -- -D warnings
stellar contract build --locked --optimize
```

Expected: `23 passed; 0 failed`.

Wasm output:

```text
target/wasm32v1-none/release/kori_deal_escrow.wasm
```

## Test, local network and Testnet

| Environment              | Purpose                                                      | Requirements                          |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------- |
| `cargo test`             | In-process Soroban host tests; no blockchain node or account | Rust                                  |
| Quickstart local network | Full local Stellar Core, RPC, Horizon and Friendbot          | Stellar CLI + Docker                  |
| Public Testnet           | Shared network with real G/C addresses and transactions      | Stellar CLI + funded Testnet accounts |

### Soroban local test model

`cargo test` runs contracts against Soroban's embedded host and a programmable
mock ledger. It is a fast contract-level environment, not a full Stellar node:
there is no RPC, consensus, transaction propagation, or persistent chain. Use
Quickstart for full local-network integration.

The repository currently automates only the first level. Quickstart is available
but is not wired into Kori scripts yet:

```bash
stellar container start local
stellar container stop local
```

Tests verify constructor safety, exact funding/deadline boundaries, evidence
versioning, authorization, exact release, accounting deficits, terminal states,
multi-investor permissionless refunds, typed event payloads, and atomic rollback
when the SAC rejects a payout or refund.

## V1 Testnet application status

- The application maps three demo SPVs to separate `DealEscrow` instances, one
  per irreversible checkpoint: funding, release, and refund. These are
  scenarios, not roles.
- Every demo startup account is distinct from the Fund Manager, release
  authority, and release signers.
- `/demo/stellar` runs without Supabase; `/dashboard` exposes the same lifecycle
  after investor or founder onboarding.
- Freighter supports live funding, startup evidence anchoring, Fund Manager
  approval, weighted release-package exchange, and permissionless refunds.
- Live amounts, state, immutable contract roles, deadlines, and escrow balance
  are read from Stellar. The reviewed release-signer policy is recorded in the
  deployment manifest and enforced by the Stellar G-account. Evidence files
  stay local and only their canonical manifest hash is anchored.
- See [`WEB3_DEMO_RUNBOOK.md`](./WEB3_DEMO_RUNBOOK.md),
  [`TESTNET_MVP_UI_REPORT.md`](./TESTNET_MVP_UI_REPORT.md), and
  [`deployments/testnet-mvp-ui-v1.json`](./deployments/testnet-mvp-ui-v1.json).

## Broader Testnet assurance

- Official Testnet USDC SAC is pinned in the contract; deployment on a network
  other than Stellar Testnet is rejected.
- A fresh deployer, two investors, startup, Lead/Fund Manager, Investor
  Representative, Kori Release Officer, and release authority are funded with
  Testnet XLM.
- Investor and startup USDC trustlines exist and Circle Testnet USDC funded the
  live assurance campaign.
- Release authority is live-verified: Lead `1`, Investor Representative `2`,
  Kori `1`, medium threshold `3`, high threshold `4`, master weight `0`. Only
  Lead + Representative or Kori + Representative can authorize release.
- Both permitted pairs completed contract releases; Lead + Kori and Kori alone
  were rejected with `TxBadAuth`.
- The optimized deployment artifact is ready: 22,419 bytes, SHA-256
  `c997029a0f411837ad0f09b48b390b84ec4a40cc98df3173ec122971b9b09263`.
- Public Testnet identities and transactions are documented for reproducibility;
  private signing material is not included in the active reference tree.
- Five live escrows exercised normal release, multi-investor refunds, recovery
  release, evidence replacement/surplus isolation, and failed-payout recovery.
- A prior untouched 5 USDC team sandbox is live at
  `CA7VZWOWBPMCCZ32QAY254PGCGZJALP4AU7ZGHG4RU3ZG64D2JNT333Y` until the
  documented deadlines.

Public identifiers and verified bootstrap state are recorded in
[`deployments/testnet-v1.json`](./deployments/testnet-v1.json). The complete
results and transaction links are in
[`TESTNET_ASSURANCE_REPORT.md`](./TESTNET_ASSURANCE_REPORT.md).

Create isolated local Testnet identities when reproducing a deployment:

```bash
stellar keys generate <test-identity> --secure-store --network testnet --fund
stellar keys public-key <test-identity>
```

Never commit the generated secret, use it in production, reuse it on Mainnet,
or send Mainnet assets to its address. Treat any historically exposed Testnet
fixture as permanently compromised. Stellar keys are not cryptographically
restricted to one network.

See the [PRD](./PRD.md) for implemented invariants and deferred work. Do not use
real funds or deploy to Mainnet.
