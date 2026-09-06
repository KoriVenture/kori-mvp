# Figma architecture reference

Boards:

- [Kori Stellar Architecture — Custody, Governance and Data](https://www.figma.com/board/FlcuMidYV5TAuMDfBc8l6o/Kori-Stellar-Architecture-%E2%80%94-Custody--Governance-and-Data?node-id=0-1)
- [Kori product ERD and actor flows](https://www.figma.com/board/lwcnxVqOFU8Nys8OBTykYC/Kori-%E2%80%94-ERD-du-noyau-d%E2%80%99investissement?node-id=0-1)

The FigJam board explains system responsibilities and transaction flows. It is
not execution evidence and must not override the deployed contract, ledger
transactions, tests, or PRD.

## Board-to-code map

| FigJam section                         | Repository evidence                                                                                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| V1 system architecture                 | [`PRD.md#7-system-architecture`](./PRD.md#7-system-architecture)                                                                                     |
| Investor funding flow                  | `fund` in [`lib.rs`](./contracts/kori-deal-escrow/src/lib.rs), the live [`DealLifecycleWorkspace`](../../src/components/stellar/DealLifecycleWorkspace.tsx), and Testnet transactions in the [UI report](./TESTNET_MVP_UI_REPORT.md) |
| Milestone approval and release         | `submit_evidence`, `approve_milestone`, and `release` in [`lib.rs`](./contracts/kori-deal-escrow/src/lib.rs), exposed in the same live workspace |
| Weighted release authority             | Release-policy evidence in [`deployments/testnet-v1.json`](./deployments/testnet-v1.json)                                                            |
| V1 state machine                       | [`PRD.md#9-v1-state-machine`](./PRD.md#9-v1-state-machine) and state tests in [`test.rs`](./contracts/kori-deal-escrow/src/test.rs)                  |
| Permissionless timeout refunds         | `open_refunds` and `claim_refund` in [`lib.rs`](./contracts/kori-deal-escrow/src/lib.rs), plus refund scenarios in the assurance report              |
| Off-chain, legal, and compliance areas | Product boundaries in [`PRD.md#4-product-boundary`](./PRD.md#4-product-boundary)                                                                     |

## Actor-flow map

| Product flow | Current V1 implementation |
| --- | --- |
| Investor | `/onboarding/investor`, followed by the shared `/dashboard` lifecycle workspace. Any compatible Testnet wallet may fund an open escrow. |
| Fund Manager | Uses the investor onboarding with `investor_type = fund_manager`; the connected wallet must still match the deal's immutable Fund Manager address to approve evidence. |
| Startup Founder | `/onboarding/founder`, followed by the same workspace. The connected wallet must match the immutable startup address to anchor evidence. |

The public `/demo/stellar` route exposes the same blockchain lifecycle without
requiring Supabase onboarding. Email/profile completion replaces the obsolete
Sumsub gates in the product-flow board; no KYC step exists in this V1.

## Alignment verified on 2026-09-05

The two boards' actor flows, custody model, signer policy, state machine, and
refund flow match the implemented V1. They were updated and visually checked on
this date to remove obsolete KYC, intermediary multisig-wallet, startup-release,
and indefinite-lock descriptions and to separate current behavior from deferred systems. The application now
provides three selectable SPVs, each mapped to a separate immutable
`DealEscrow`: Kigali is staged for evidence/approval/release, Kingston for open
funding, and Accra for the deadline-refund branch. Current deployment evidence is in
[`TESTNET_MVP_UI_REPORT.md`](./TESTNET_MVP_UI_REPORT.md) and
[`deployments/testnet-mvp-ui-v1.json`](./deployments/testnet-mvp-ui-v1.json).

The board remains an explanation. Use the repository evidence and live ledger
transactions to prove current implementation status.

The milestone sequence also documents the non-circular evidence boundary:

1. source documents produce one canonical manifest hash;
2. the startup anchors that hash and receives the confirmed evidence version;
3. future `AIReviewRecord` and durable `HumanDecisionRecord` entries may
   separately reference that same hash/version;
4. only the Fund Manager's on-chain approval changes contract state.

AI output and human decision data are never part of the evidence-manifest hash
preimage. AI advisory remains a future off-chain component and is not present in
the current application.
