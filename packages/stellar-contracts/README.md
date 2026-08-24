# Kori Stellar Contracts

Soroban prototype for one deal, one milestone and one full USDC release. It
implements the on-chain core of the current [Stellar architecture](https://www.figma.com/board/FlcuMidYV5TAuMDfBc8l6o/Kori-Stellar-Architecture-%E2%80%94-Custody--Governance-and-Data)
while retaining `packages/contracts` only as the historical EVM reference. See
the [Stellar/Soroban PRD](./PRD.md) for the complete target, current gaps and
build order.

## Current flow

1. An investor authenticates `fund`; the SAC transfers assets into DealEscrow.
2. The Fund Manager approves an off-chain evidence hash.
3. A separate release authority authenticates `release`.
4. DealEscrow transfers its full balance to the startup.

AI and evidence documents remain off-chain.

## Prerequisites

- Rust and Cargo
- `wasm32v1-none` Rust target
- Stellar CLI and Docker only for a local network or Testnet deployment

## Getting started

```bash
git fetch origin
git switch liobrasil/stellar-soroban-escrow
cd packages/stellar-contracts

rustup target add wasm32v1-none
cargo test
cargo clippy --all-targets -- -D warnings
cargo build --target wasm32v1-none --release
```

Expected: `7 passed; 0 failed`.

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

Tests verify funding, contribution accounting, role authorization, milestone
approval, full release and failure/replay conditions.

See [ARCHITECTURE_MIGRATION.md](./ARCHITECTURE_MIGRATION.md) for implemented
invariants and deferred work. Do not deploy, generate keys or use real funds
without explicit authorization.
