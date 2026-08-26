# Kori Stellar Contracts

Soroban V1 for one deal, one milestone and one exact USDC release. It
implements the on-chain core of the current [Stellar architecture](https://www.figma.com/board/FlcuMidYV5TAuMDfBc8l6o/Kori-Stellar-Architecture-%E2%80%94-Custody--Governance-and-Data)
while retaining `packages/contracts` only as the historical EVM reference. See
the [Stellar/Soroban PRD](./PRD.md) for the complete target, current gaps and
build order.

## Current flow

1. An investor authenticates `fund`; the pinned official Testnet USDC SAC
   transfers assets into DealEscrow.
2. The exact target closes funding; the startup signs an evidence hash.
3. The Fund Manager/Lead Investor approves that exact evidence version.
4. A weighted account requires the Investor Representative plus either the Lead
   or Kori Release Officer to authorize the exact payout.
5. If a deadline expires, anyone may trigger per-investor refunds to the
   original addresses; the caller cannot redirect funds.

AI and evidence documents remain off-chain.

## Prerequisites

- Rust and Cargo
- `wasm32v1-none` Rust target
- Stellar CLI for Testnet deployment
- Docker only for a full local Quickstart network

## Getting started

```bash
git fetch origin
git switch liobrasil/stellar-soroban-escrow
cd packages/stellar-contracts

rustup target add wasm32v1-none
cargo test
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

### EVM developer mental model

`cargo test` runs contracts against Soroban's embedded host and a programmable
mock ledger. It is the fast, contract-level equivalent of Foundry unit tests,
not an Anvil/Hardhat node: there is no RPC, consensus, transaction propagation
or persistent chain. Use Quickstart for full local-network integration.

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

## V1 Testnet bootstrap status

- Official Testnet USDC SAC is pinned in the contract; deployment on a network
  other than Stellar Testnet is rejected.
- A fresh deployer, two investors, startup, Lead/Fund Manager, Investor
  Representative, Kori Release Officer, and release authority are funded with
  Testnet XLM.
- Investor and startup USDC trustlines exist; their USDC balances are still
  zero pending the Circle faucet.
- Release authority is live-verified: Lead `1`, Investor Representative `2`,
  Kori `1`, medium threshold `3`, high threshold `4`, master weight `0`. Only
  Lead + Representative or Kori + Representative can authorize release.
- Both permitted pairs completed minimal Testnet payments; Lead + Kori was
  rejected with `TxBadAuth`. Hashes are recorded in the deployment manifest.
- The optimized deployment artifact is ready: 22,419 bytes, SHA-256
  `c997029a0f411837ad0f09b48b390b84ec4a40cc98df3173ec122971b9b09263`.
- The shared identities and their secrets are intentionally public Testnet
  fixtures. This proves protocol behavior, not separation of control.
- No escrow contract has been deployed yet.

Public identifiers and verified bootstrap state are recorded in
[`deployments/testnet-v1.json`](./deployments/testnet-v1.json). Team fixture
secrets are in
[`deployments/PUBLIC_TESTNET_TEAM_KEYS.json`](./deployments/PUBLIC_TESTNET_TEAM_KEYS.json).
Import all fixtures into Stellar CLI with:

```bash
jq -r '.accounts[] | [.identityAlias, .secretKey] | @tsv' \
  deployments/PUBLIC_TESTNET_TEAM_KEYS.json \
  | while IFS=$'\t' read -r alias secret; do
      printf '%s\n' "$secret" \
        | stellar keys add "$alias" --secret-key --overwrite
    done
```

These keys are **public and compromised by design**. Never use them in
production, never use them on Mainnet, and never send Mainnet assets to their
addresses. Stellar keys are not cryptographically restricted to one network.
Never commit any private key other than this explicitly labelled fixture set.

See [ARCHITECTURE_MIGRATION.md](./ARCHITECTURE_MIGRATION.md) for implemented
invariants and deferred work. Testnet identities were generated after explicit
authorization; do not use real funds or deploy to Mainnet from this branch.
