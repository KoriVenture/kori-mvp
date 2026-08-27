# Kori Soroban V1 — Testnet Assurance Report

> **Result:** PASS for the scoped Testnet V1. **Not a production audit.**
> **Execution:** 2026-08-26 UTC · Stellar Testnet · Protocol 27 · Stellar CLI 27.1.0

## Verdict

The deployed Wasm completed five independent live scenarios using Circle USDC
Testnet assets: normal release, underfunded refunds, recovery release, evidence
replacement with unsolicited-fund isolation, and failed-payout recovery. All
successful operations below were independently found in Horizon after
submission.

| Assessment                        |    Score | Why                                                                                                             |
| --------------------------------- | -------: | --------------------------------------------------------------------------------------------------------------- |
| Scoped contract/Testnet assurance | **9/10** | Core custody, authorization, state, payout, rollback, and refund paths ran on the public network.               |
| Team-demo readiness               | **8/10** | A clean shared sandbox is live; frontend/indexer automation is still absent.                                    |
| Production readiness              | **3/10** | No independent audit, production key governance, legal/custody approval, TTL operations, or Mainnet deployment. |

## Artifact under test

| Property         | Verified value                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| Contract         | `KoriDealEscrow` — one deal, one milestone, one exact release                                                   |
| Wasm SHA-256     | `c997029a0f411837ad0f09b48b390b84ec4a40cc98df3173ec122971b9b09263`                                              |
| Optimized size   | 22,419 bytes                                                                                                    |
| Asset            | Circle USDC Stellar Asset Contract (SAC)                                                                        |
| USDC SAC         | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`                                                      |
| Custody          | Deal contract C-address                                                                                         |
| Normal release   | Lead/Fund Manager `1` + Investor Representative `2` = threshold `3`                                             |
| Recovery release | Kori Release Officer `1` + Investor Representative `2` = threshold `3`                                          |
| Forbidden pair   | Lead `1` + Kori `1` = `2`; rejected below threshold `3`                                                         |
| Release evidence | `testnet-release-evidence-v1.json` · SHA-256 `94cebd59f63ee34dc135235198d3ae30252aaebb963cb1022a7117d69723c673` |

Amounts are shown in USDC; on-chain arguments use 7-decimal base units
(`1 USDC = 10,000,000`).

`testnet-release-evidence-v1.json` is the source-evidence manifest preimage used
for this historical campaign. Its digest does not include AI output or the Fund
Manager decision; those are downstream records in the current application
specification. This clarification does not change any deployed transaction or
Wasm behavior.

## Live scenario matrix

|   # | Scenario                                          | Contract                                                                                                                  | Final proof                                                                                                                  | Result                                                    |
| --: | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
|   1 | Two investors, evidence, approval, normal release | [`CDJFW…LUCL`](https://stellar.expert/explorer/testnet/contract/CDJFW5EISTACAQ7W5DPIYOV3C2BENTXYKGPLG5B5JOAED3ULDDJXLUCL) | [`a8f04a…26ec`](https://stellar.expert/explorer/testnet/tx/a8f04adf7bbcf990a8d05d3acd6729e60fb2be6cce6494e51588ba543b8826ec) | `Released`; startup received 3; escrow = 0                |
|   2 | Underfunded multi-investor timeout                | [`CD742…MHMU`](https://stellar.expert/explorer/testnet/contract/CD742EYPMVU3SROYGOKBPYI43XLZF75XSKCGLFJEAG3PPOOOK3KNMHMU) | [`0f0b84…f68a`](https://stellar.expert/explorer/testnet/tx/0f0b84c5e2720a1a9ea95142ace55efd9eab975caa9b25595d6edce9ff83f68a) | `Refunded`; 1 + 1 returned; escrow = 0                    |
|   3 | Recovery authorization                            | [`CD26O…34BO`](https://stellar.expert/explorer/testnet/contract/CD26OIFLDEMXGK6RFHSOGBMUUXDMWSMNYXLMGBD4VHAU6BRT7HP234BO) | [`e7d538…0414`](https://stellar.expert/explorer/testnet/tx/e7d538dc6d5f8ef2cf87f5252a262e2ae837c7b2d1351e677684630ede610414) | Kori + Representative released 1; escrow = 0              |
|   4 | Evidence v2 + unsolicited surplus                 | [`CCJBK…D65L`](https://stellar.expert/explorer/testnet/contract/CCJBKDVARGRXJIDHTNQRQ4AW3FBE454KSH4CI5QZW4NEA76FGHDQD65L) | [`e06805…f4d1`](https://stellar.expert/explorer/testnet/tx/e06805ae859a6108cbf159860ce5e635c324b8e7212d38f11e56a3f312e4f4d1) | Released exactly 2; unsolicited 0.5 remains isolated      |
|   5 | Startup cannot receive USDC                       | [`CDQQV…4KPD`](https://stellar.expert/explorer/testnet/contract/CDQQVVGGPTNYFP4R4P5FIKOUONOOXM5LXLCDB2KWE35NU5SJMNNG4KPD) | [`f06fe6…cf0d`](https://stellar.expert/explorer/testnet/tx/f06fe6021e137e19f5891ecf1c511b36dd438a83ba16b84b69708adc9ca5cf0d) | Payout rolled back; after deadline 1 returned; `Refunded` |

### 1. Normal release — Lead + Representative

State path: `FundingOpen → Funded → EvidenceSubmitted → Approved → Released`.

| Action                        | Amount | Transaction                                                                                                                                                                       |
| ----------------------------- | -----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deploy                        |      — | [`c8568fb000b894706efd3f6ae0b8626b68a2c2e02d4b66996ef79a2a0911974c`](https://stellar.expert/explorer/testnet/tx/c8568fb000b894706efd3f6ae0b8626b68a2c2e02d4b66996ef79a2a0911974c) |
| Investor A funds              |      1 | [`449447554d4d6570a6d19513fcb77956a733e56d8b5ca3524bbe3db3d8622fa9`](https://stellar.expert/explorer/testnet/tx/449447554d4d6570a6d19513fcb77956a733e56d8b5ca3524bbe3db3d8622fa9) |
| Investor B funds              |      2 | [`e64f44f1942305ca413fd48b6c1d0a5189a3b82513c11527d8ce11e23ae74df2`](https://stellar.expert/explorer/testnet/tx/e64f44f1942305ca413fd48b6c1d0a5189a3b82513c11527d8ce11e23ae74df2) |
| Startup submits evidence      |      — | [`c492f03547f4c3e18499b8c4d2271a4b26736f34ca0ebfc15820e6dea316be3d`](https://stellar.expert/explorer/testnet/tx/c492f03547f4c3e18499b8c4d2271a4b26736f34ca0ebfc15820e6dea316be3d) |
| Lead approves                 |      — | [`9feafba2d1afffcd87532bd1725b22d68440b1bb6b5a69c4adee4e7632df57ee`](https://stellar.expert/explorer/testnet/tx/9feafba2d1afffcd87532bd1725b22d68440b1bb6b5a69c4adee4e7632df57ee) |
| Lead + Representative release |      3 | [`a8f04adf7bbcf990a8d05d3acd6729e60fb2be6cce6494e51588ba543b8826ec`](https://stellar.expert/explorer/testnet/tx/a8f04adf7bbcf990a8d05d3acd6729e60fb2be6cce6494e51588ba543b8826ec) |

Wrong release amount was rejected with `ReleaseMismatch`; replay after release
was rejected with `InvalidState`. Neither rejected simulation reached a ledger.

### 2. Underfunded timeout — permissionless refunds

Target was 3; only 2 was funded. A caller unrelated to Investor A claimed A's
refund, and the Kori Release Officer claimed Investor B's refund. Funds could
only return to the recorded investor addresses.

| Action             | Amount | Transaction                                                                                                                                                                       |
| ------------------ | -----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deploy             |      — | [`e111b929d03e75fae6ab979c11ef32f948364b1faf4d18aa330ac2b0f14568c0`](https://stellar.expert/explorer/testnet/tx/e111b929d03e75fae6ab979c11ef32f948364b1faf4d18aa330ac2b0f14568c0) |
| Investor A funds   |      1 | [`e1130cdb2bf18469ee5922b5d5eaa4cefc572f62e2edb2f921232158553fdf69`](https://stellar.expert/explorer/testnet/tx/e1130cdb2bf18469ee5922b5d5eaa4cefc572f62e2edb2f921232158553fdf69) |
| Investor B funds   |      1 | [`9f6af518f2efaf87a7715af6c2c498b3319a0595c085185ffd0034f70de5d71f`](https://stellar.expert/explorer/testnet/tx/9f6af518f2efaf87a7715af6c2c498b3319a0595c085185ffd0034f70de5d71f) |
| Public claim for A |      1 | [`7971bacaea073ad856cdd08d3d7e4d674b149dfed6858925041d2c3e139bb17c`](https://stellar.expert/explorer/testnet/tx/7971bacaea073ad856cdd08d3d7e4d674b149dfed6858925041d2c3e139bb17c) |
| Public claim for B |      1 | [`0f0b84c5e2720a1a9ea95142ace55efd9eab975caa9b25595d6edce9ff83f68a`](https://stellar.expert/explorer/testnet/tx/0f0b84c5e2720a1a9ea95142ace55efd9eab975caa9b25595d6edce9ff83f68a) |

Opening refunds before the funding deadline was rejected with
`RefundNotAvailable`; a second claim was rejected with `AlreadyRefunded`.

### 3. Recovery release — Kori + Representative

The deal completed normally through Lead approval. Kori alone was below the
account threshold; Kori + Investor Representative authorized the exact 1 USDC
release.

| Action                        | Transaction                                                                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deploy                        | [`ed77857b61768743c51407df5a9dc28ab0ee6c71cf38f11803a89b1c0aa73cf1`](https://stellar.expert/explorer/testnet/tx/ed77857b61768743c51407df5a9dc28ab0ee6c71cf38f11803a89b1c0aa73cf1) |
| Fund                          | [`2722a0f7299b43f5816b4344b4a4dc539fe8c319570baee8b07a5c47d4357546`](https://stellar.expert/explorer/testnet/tx/2722a0f7299b43f5816b4344b4a4dc539fe8c319570baee8b07a5c47d4357546) |
| Evidence                      | [`f200d7a83d9ec7d88284ab54d2bdc19b9cd6acb1e51ecf3258a78bd4d85dbe02`](https://stellar.expert/explorer/testnet/tx/f200d7a83d9ec7d88284ab54d2bdc19b9cd6acb1e51ecf3258a78bd4d85dbe02) |
| Approval                      | [`8b2467ecf5b277a2d37a22449c4c50e0b220d164ab9e006561676c0640f7e2ee`](https://stellar.expert/explorer/testnet/tx/8b2467ecf5b277a2d37a22449c4c50e0b220d164ab9e006561676c0640f7e2ee) |
| Kori + Representative release | [`e7d538dc6d5f8ef2cf87f5252a262e2ae837c7b2d1351e677684630ede610414`](https://stellar.expert/explorer/testnet/tx/e7d538dc6d5f8ef2cf87f5252a262e2ae837c7b2d1351e677684630ede610414) |

### 4. Evidence replacement and unsolicited surplus

Two investors funded the exact 2 USDC target. A direct 0.5 USDC SAC transfer
then increased the contract's token balance without changing `total_funded`.
Evidence v1 was replaced by v2; approval of stale v1 failed with
`EvidenceMismatch`. Only v2 was approved and exactly 2 USDC was released. The
unattributed 0.5 USDC remains at the contract address and cannot be swept in V1.

| Action              | Transaction                                                                                                                                                                                                                                                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deploy              | [`beb47eb58f682a7ad20741b6e1e45720132a6ac7c86396944d333ca3cb29d3e6`](https://stellar.expert/explorer/testnet/tx/beb47eb58f682a7ad20741b6e1e45720132a6ac7c86396944d333ca3cb29d3e6)                                                                                                                                                                                     |
| Investor A / B fund | [`22b6912d641d5cdda820a7ef21412cb27c016f24df74112e84a023539188ca51`](https://stellar.expert/explorer/testnet/tx/22b6912d641d5cdda820a7ef21412cb27c016f24df74112e84a023539188ca51) · [`619c4cf6cbff9ff21cc9b4e3c5fe0e6fcdd5bf5b08cdaf3093b39c31d8bcfee2`](https://stellar.expert/explorer/testnet/tx/619c4cf6cbff9ff21cc9b4e3c5fe0e6fcdd5bf5b08cdaf3093b39c31d8bcfee2) |
| Direct surplus      | [`a96f226a155982527fbf136a5df37d657829491276d9517eff36a7d363cd4d8c`](https://stellar.expert/explorer/testnet/tx/a96f226a155982527fbf136a5df37d657829491276d9517eff36a7d363cd4d8c)                                                                                                                                                                                     |
| Evidence v1 / v2    | [`d213faa439595cb9ebd955146b745fc41cda733d78bd9a77c284ef5f7dcc6168`](https://stellar.expert/explorer/testnet/tx/d213faa439595cb9ebd955146b745fc41cda733d78bd9a77c284ef5f7dcc6168) · [`9eb64ad875d8ddb4337cfbafe05a201df260ddeee414240955c98b1f8386f47f`](https://stellar.expert/explorer/testnet/tx/9eb64ad875d8ddb4337cfbafe05a201df260ddeee414240955c98b1f8386f47f) |
| Approve v2          | [`0081f090d6678d7b7202b1b10428d262fdc3a8789e0fcfa763ebf012affaf080`](https://stellar.expert/explorer/testnet/tx/0081f090d6678d7b7202b1b10428d262fdc3a8789e0fcfa763ebf012affaf080)                                                                                                                                                                                     |
| Release 2           | [`e06805ae859a6108cbf159860ce5e635c324b8e7212d38f11e56a3f312e4f4d1`](https://stellar.expert/explorer/testnet/tx/e06805ae859a6108cbf159860ce5e635c324b8e7212d38f11e56a3f312e4f4d1)                                                                                                                                                                                     |

### 5. Failed startup payout and recovery

The startup account intentionally had XLM but no USDC trustline. SAC simulation
rejected payout with `trustline entry is missing for account`. The failed
invocation produced no ledger transaction: state stayed `Approved`,
`total_released` stayed zero, and 1 USDC remained in escrow. A pre-deadline
refund was rejected. After the immutable release deadline, an unrelated caller
claimed the investor's refund.

| Action                | Transaction                                                                                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deploy                | [`1d52c13664baab7a4ce27a05f3a344ab69b1eabd80d2087ab3491f4bcfd6c1d0`](https://stellar.expert/explorer/testnet/tx/1d52c13664baab7a4ce27a05f3a344ab69b1eabd80d2087ab3491f4bcfd6c1d0) |
| Fund 1                | [`5caf91afd0ae5d9b021f7cd13df1829ee72a3e925d12f1902e789c528212f9e7`](https://stellar.expert/explorer/testnet/tx/5caf91afd0ae5d9b021f7cd13df1829ee72a3e925d12f1902e789c528212f9e7) |
| Evidence              | [`9c0faeabc320ba1b89da574baf0675389057e22c740e25dfe4614299192ef74f`](https://stellar.expert/explorer/testnet/tx/9c0faeabc320ba1b89da574baf0675389057e22c740e25dfe4614299192ef74f) |
| Approval              | [`05f4ab92315e302a67b351e17946c326dae68b57da11e147841b632bde275d2a`](https://stellar.expert/explorer/testnet/tx/05f4ab92315e302a67b351e17946c326dae68b57da11e147841b632bde275d2a) |
| Public timeout refund | [`f06fe6021e137e19f5891ecf1c511b36dd438a83ba16b84b69708adc9ca5cf0d`](https://stellar.expert/explorer/testnet/tx/f06fe6021e137e19f5891ecf1c511b36dd438a83ba16b84b69708adc9ca5cf0d) |

## Authorization and rejection evidence

| Check                                  | Observed result                     | Ledger transaction?     |
| -------------------------------------- | ----------------------------------- | ----------------------- |
| Lead + Representative release          | Success                             | Yes                     |
| Kori + Representative recovery release | Success                             | Yes                     |
| Lead + Kori, without Representative    | `TxBadAuth`                         | No                      |
| Kori alone                             | `TxBadAuth`                         | No                      |
| Wrong release amount                   | `ReleaseMismatch`                   | No; simulation rejected |
| Stale evidence approval                | `EvidenceMismatch`                  | No; simulation rejected |
| Double release                         | `InvalidState`                      | No; simulation rejected |
| Refund before deadline                 | `RefundNotAvailable`                | No; simulation rejected |
| Double refund claim                    | `AlreadyRefunded`                   | No; simulation rejected |
| Startup without USDC trustline         | SAC `Contract #13`; atomic rollback | No; simulation rejected |

Stellar signatures are not part of a transaction's hash. Therefore the same
assembled release body first returned `TxBadAuth` with insufficient signatures
and later succeeded after the required signature was appended. This is expected
protocol behavior, not two different business transactions.

## Shared team sandbox

An untouched 5 USDC deal is available for coordinated team use:

- Contract: [`CA7VZWOWBPMCCZ32QAY254PGCGZJALP4AU7ZGHG4RU3ZG64D2JNT333Y`](https://stellar.expert/explorer/testnet/contract/CA7VZWOWBPMCCZ32QAY254PGCGZJALP4AU7ZGHG4RU3ZG64D2JNT333Y)
- Deployment: [`e67ef963de46416ff82e6def36d253c76ee27f484e9921344c656e7809366386`](https://stellar.expert/explorer/testnet/tx/e67ef963de46416ff82e6def36d253c76ee27f484e9921344c656e7809366386)
- Initial state: `FundingOpen`; funded/released/refunded totals: `0/0/0`
- Target: 5 USDC
- Funding deadline: 2026-08-29 23:00 UTC
- Release deadline: 2026-08-31 23:00 UTC

Using isolated Testnet identities represented by the public addresses in the
deployment manifest:

```bash
export KORI_CONTRACT_ID=CA7VZWOWBPMCCZ32QAY254PGCGZJALP4AU7ZGHG4RU3ZG64D2JNT333Y

stellar contract invoke --id "$KORI_CONTRACT_ID" \
  --source kori-v1-team-deployer --network testnet -- state

stellar contract invoke --id "$KORI_CONTRACT_ID" \
  --source kori-v1-team-investor-a --network testnet -- fund \
  --investor GDDWS25MKDXHW3FNRSKGT4G6LODA7UL5F7NDXDI4LS7HCSABVFYLRBTF \
  --amount 10000000
```

The sandbox is shared mutable state: coordinate before funding it. For a
multisig release, `stellar contract invoke --build-only` is only step one. Run
`stellar tx simulate` to assemble resources and authorization, then append the
two permitted signer signatures with `stellar tx sign`, and finally use
`stellar tx send`.

## Independent checks and limits

- Horizon confirmed every listed successful hash, ledger inclusion, and
  success status.
- Final contract views and SAC balances reconcile for all five scenarios.
- Local QA: 23/23 tests, formatting, strict Clippy, optimized Wasm build, and
  RustSec audit with no known vulnerability. `paste 1.0.15` remains an
  unmaintained transitive host/test dependency and is absent from the Wasm
  target.
- Testnet identities in this repository are deliberately public and
  compromised. They demonstrate protocol mechanics, **not** organizational
  separation of control.
- Testnet can reset. Contract IDs, accounts, balances, and history are not
  permanent.
- This work does not prove frontend/indexer behavior, evidence privacy, KYC/KYB,
  legal SPV validity, production incident handling, or Mainnet safety.

Machine-readable addresses, configurations, balances, and hashes are in
[`deployments/testnet-v1.json`](./deployments/testnet-v1.json).
