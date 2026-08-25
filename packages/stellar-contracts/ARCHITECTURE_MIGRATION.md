# EVM to Stellar architecture migration

## Purpose

This package tests whether Kori's current deal workflow can be expressed with
Stellar-native authorization and asset movement. It is deliberately separate
from `packages/contracts`, which remains the EVM reference implementation.

The prototype scope is one deal, one milestone and one full release. It does not
claim to be the final production custody or legal model.

## Role mapping

| Product responsibility | Stellar implementation |
| --- | --- |
| Investor funds a deal | Investor authenticates `fund`; the USDC SAC transfer occurs in the same invocation |
| Deal custody | USDC balance is held by the deal's Soroban contract address |
| Milestone evidence review | Community-scoped Fund Manager approves the evidence hash |
| Payout authorization | Separate `release_authority` authenticates `release` |
| Threshold governance | `release_authority` may be a native Stellar multisig G-account |
| Startup payout | Full escrow balance transfers to the immutable startup address |
| AI analysis | Off-chain and advisory; never an on-chain authority |
| Evidence documents | Off-chain; only a 32-byte integrity hash is stored on-chain |

The Fund Manager and release authority are intentionally different
responsibilities, even if the initial demo assigns the same person to both.

## Custody model

The contract holds the deal funds. A Stellar multisig account may govern the
release call, but it does not need to hold the pooled balance. This keeps the
programmed milestone condition and the asset transfer atomic.

This is materially different from a treasury model in which a classic Stellar
account holds the funds and human signers manually send each payout.

## Enforced invariants in this prototype

- Funding amounts must be strictly positive.
- Investors authenticate their own funding operations.
- Contributions are attributable and cumulative per investor.
- Funding is rejected after the final release.
- A milestone evidence hash must be approved before release.
- Only the configured Fund Manager can authenticate milestone approval.
- The configured release authority must authenticate the payout.
- Empty escrows cannot be released.
- The release transfers the full escrow balance to the configured startup.
- A deal cannot be released twice.

## Decided refund target

If the deal remains unreleased after its immutable release deadline, anyone may
call `claim_refund(investor)`. The contract must return only that investor's
recorded unreleased contribution to the original funding address. The caller
cannot choose a destination or receive the funds. Claims are processed one
investor at a time; this permissionless path is not implemented yet.

## Verification performed

- `cargo fmt --all -- --check`
- `cargo test`: seven passing tests, including explicit role-authorization checks
- `cargo clippy --all-targets -- -D warnings`
- optimized `wasm32v1-none` release build

## Explicitly deferred

- Testnet contract deployment and end-to-end execution (the verified USDC SAC
  is now pinned and the required Testnet identities exist)
- Funding target and exact funding/release deadlines
- Permissionless refund implementation and non-timeout cancellation/disputes
- Multiple milestones or partial releases
- Pausing, signer rotation and upgrade governance
- Storage TTL maintenance and event ingestion
- KYC/KYB allowlisting
- Legal SPV, custody and regulatory decisions
- Independent security review and audit

These items must be resolved before describing the contract as production-ready
or using it with real funds.
