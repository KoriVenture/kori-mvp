# Figma architecture reference

Board: [Kori Stellar Architecture — Custody, Governance and Data](https://www.figma.com/board/FlcuMidYV5TAuMDfBc8l6o/Kori-Stellar-Architecture-%E2%80%94-Custody--Governance-and-Data?node-id=0-1)

The FigJam board explains system responsibilities and transaction flows. It is
not execution evidence and must not override the deployed contract, ledger
transactions, tests, or PRD.

## Board-to-code map

| FigJam section                         | Repository evidence                                                                                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| V1 system architecture                 | [`PRD.md#7-system-architecture`](./PRD.md#7-system-architecture)                                                                                     |
| Investor funding flow                  | `fund` in [`lib.rs`](./contracts/kori-deal-escrow/src/lib.rs) and live funding transactions in the [assurance report](./TESTNET_ASSURANCE_REPORT.md) |
| Milestone approval and release         | `submit_evidence`, `approve_milestone`, and `release` in [`lib.rs`](./contracts/kori-deal-escrow/src/lib.rs)                                         |
| Weighted release authority             | Release-policy evidence in [`deployments/testnet-v1.json`](./deployments/testnet-v1.json)                                                            |
| V1 state machine                       | [`PRD.md#9-v1-state-machine`](./PRD.md#9-v1-state-machine) and state tests in [`test.rs`](./contracts/kori-deal-escrow/src/test.rs)                  |
| Permissionless timeout refunds         | `open_refunds` and `claim_refund` in [`lib.rs`](./contracts/kori-deal-escrow/src/lib.rs), plus refund scenarios in the assurance report              |
| Off-chain, legal, and compliance areas | Product boundaries in [`PRD.md#4-product-boundary`](./PRD.md#4-product-boundary)                                                                     |

## Alignment verified on 2026-08-26

The board topology, custody model, signer policy, state machine, and refund flow
match the implemented V1. Its overview, funding, release, and refund captions
were synchronized with the completed Testnet assurance campaign recorded at
commit `881f4fe` in
[`TESTNET_ASSURANCE_REPORT.md`](./TESTNET_ASSURANCE_REPORT.md) and
[`deployments/testnet-v1.json`](./deployments/testnet-v1.json).

The board remains an explanation. Use the repository evidence and live ledger
transactions to prove current implementation status.

The milestone sequence also documents the non-circular evidence boundary:

1. source documents produce one canonical manifest hash;
2. the startup anchors that hash and receives the confirmed evidence version;
3. `AIReviewRecord` and `HumanDecisionRecord` separately reference that same
   hash/version;
4. only the Fund Manager's on-chain approval changes contract state.

AI output and human decision data are never part of the evidence-manifest hash
preimage.
