# EVM to Stellar architecture migration

## Purpose

This package tests whether Kori's current deal workflow can be expressed with
Stellar-native authorization and asset movement. It is deliberately separate
from `packages/contracts`, which remains the EVM reference implementation.

The prototype scope is one deal, one milestone and one full release. It does not
claim to be the final production custody or legal model.

## Role mapping

| Product responsibility | Stellar implementation                                                              |
| ---------------------- | ----------------------------------------------------------------------------------- |
| Investor funds a deal  | Investor authenticates `fund`; the USDC SAC transfer occurs in the same invocation  |
| Deal custody           | USDC balance is held by the deal's Soroban contract address                         |
| Milestone evidence     | Startup signs a canonical source-manifest hash; Fund Manager approves that version  |
| Payout authorization   | Separate weighted `release_authority` authenticates the exact release               |
| Threshold governance   | Investor Representative plus Lead, or Investor Representative plus Kori             |
| Startup payout         | Exact immutable target transfers once to the immutable startup address              |
| Timeout safety         | Anyone may open/claim refunds; funds return only to original investors              |
| AI analysis            | Separate off-chain record referencing the manifest hash/version; never an authority |
| Evidence documents     | Off-chain; only the 32-byte source-manifest digest is stored on-chain               |

The Fund Manager and release authority are intentionally different
responsibilities, even if the initial demo assigns the same person to both.

The evidence pipeline is deliberately one-way: source documents produce a
canonical manifest and digest; AI review and the Fund Manager decision are
later append-only records that reference that digest. They are never hashed back
into the manifest they assess.

## Custody model

The contract holds the deal funds. A Stellar multisig account may govern the
release call, but it does not need to hold the pooled balance. This keeps the
programmed milestone condition and the asset transfer atomic.

This is materially different from a treasury model in which a classic Stellar
account holds the funds and human signers manually send each payout.

The public V1 Testnet fixture is configured and verified with Lead weight `1`,
Investor Representative weight `2`, Kori weight `1`, medium threshold `3`, high
threshold `4`, and master weight `0`. The Representative is therefore mandatory;
Lead + Kori cannot authorize a release.

## Enforced invariants in this prototype

- Funding amounts must be strictly positive.
- Investors authenticate their own funding operations.
- Contributions are attributable and cumulative per investor.
- Funding is capped at the exact target and rejected at/after its deadline.
- Exact funding automatically transitions the deal to `Funded`.
- Startup evidence submissions are versioned and immutable after approval.
- The Fund Manager approval binds the exact hash, version, and target amount.
- Only the configured Fund Manager can authenticate milestone approval.
- The configured weighted release authority must authenticate the exact payout.
- Release is rejected at/after the release deadline.
- The release transfers the target, never an unsolicited SAC surplus.
- A deal cannot be released twice.
- Funding-target and release-timeout refunds are permissionless and per investor.
- A refund caller cannot redirect or receive another investor's funds.
- Release and refund terminal states are mutually exclusive.
- A SAC deficit blocks settlement without corrupting state.

## Decided refund target

If funding misses its target or a funded deal misses its release deadline,
anyone may call `open_refunds()` or `claim_refund(investor)`. The contract
returns only that investor's recorded contribution to the same address. Claims
are processed one investor at a time; this path is implemented and tested.

## Verification performed

- `cargo fmt --all -- --check`
- `cargo test`: 23 passing tests, including deadlines, exact release binding,
  multi-investor refunds, terminal states, surplus isolation, typed events,
  failed-SAC rollback, and auth checks
- `cargo clippy --all-targets -- -D warnings`
- optimized `wasm32v1-none` release build
- current RustSec audit: no known vulnerabilities; one unmaintained transitive
  `paste` warning exists in the Soroban host/test dependency graph and is absent
  from the `wasm32v1-none` target
- five public Testnet USDC scenarios covering both release pairs, multi-investor
  refunds, evidence replacement, surplus isolation, failed-payout rollback, and
  post-deadline recovery; see
  [`TESTNET_ASSURANCE_REPORT.md`](./TESTNET_ASSURANCE_REPORT.md)

## Explicitly deferred

- Non-timeout cancellation/disputes (V2)
- Multiple milestones or partial releases
- Pausing, signer rotation and upgrade governance
- Storage TTL maintenance and event ingestion
- KYC/KYB allowlisting
- Legal SPV, custody and regulatory decisions
- Independent security review and audit

These items must be resolved before describing the contract as production-ready
or using it with real funds.
