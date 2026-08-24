# Kori Stellar Contracts

This package is the first executable step of Kori's EVM-to-Stellar migration. It
implements the custody and governance boundaries shown in the current
[Stellar architecture board](https://www.figma.com/board/FlcuMidYV5TAuMDfBc8l6o/Kori-Stellar-Architecture-%E2%80%94-Custody--Governance-and-Data)
without deleting the existing EVM sandbox.

## Current prototype

`KoriDealEscrow` models the current demo scope: one deal, one milestone and one
full release.

1. An authenticated investor calls `fund`.
2. The contract transfers the accepted asset through its Stellar Asset Contract
   (USDC SAC for the MVP) into the escrow contract address.
3. The Fund Manager approves the hash of the off-chain milestone evidence.
4. A separate release authority authorizes `release`. That authority may be a
   native Stellar multisig account.
5. The contract transfers its full USDC balance to the immutable startup address.

The AI and evidence documents remain off-chain. AI is advisory and never signs
or moves funds.

## Why this differs from the EVM sandbox

| EVM sandbox | Stellar prototype |
| --- | --- |
| ERC-20 token | USDC Stellar Asset Contract (SAC) |
| `transferFrom` after ERC-20 approval | Authorized SAC transfer in the `fund` invocation |
| Safe address calls `release` | Stellar release-authority address calls `release` |
| Independent milestone verifier | Community-scoped Fund Manager |
| Contract holds ERC-20 | Soroban contract address holds USDC SAC balance |

## Local checks

```bash
cd packages/stellar-contracts
cargo fmt --all -- --check
cargo test
cargo clippy --all-targets -- -D warnings
cargo build --target wasm32v1-none --release
```

## Test coverage

| Scenario | Expected result |
| --- | --- |
| Complete funding, approval and release lifecycle | Full escrow balance reaches the startup and the deal becomes final |
| Zero-value funding | Rejected without changing escrow accounting |
| Repeated contributions by one investor | Investor attribution and aggregate funding both accumulate |
| Release before milestone approval | Rejected even when the escrow is funded |
| Release of an approved but empty escrow | Rejected without finalizing the deal |
| Second release attempt | Rejected after the first terminal payout |
| Role authorization boundaries | Funding, evidence approval and payout require the investor, Fund Manager and release authority respectively |

The contract source uses Rustdoc comments as the Soroban/Rust equivalent of
NatSpec. They document roles, authorization, effects, errors and the deliberately
limited prototype scope.

The Wasm build requires Rust's `wasm32v1-none` target. Testnet deployment also
requires the Stellar CLI. USDC SAC configuration, refunds, deadlines, signer
rotation and production custody/legal decisions are not yet implemented.

See [ARCHITECTURE_MIGRATION.md](./ARCHITECTURE_MIGRATION.md) for the role and
custody mapping, enforced invariants and explicit non-goals.

## Status

- Architecture migration: completed and reviewed in FigJam.
- Soroban project scaffold: completed.
- Deal escrow prototype: implemented with seven unit tests and a successful Wasm build.
- Stellar Testnet deployment: not started.
- Production-ready contract: no; security, legal/custody and failure paths remain open.
