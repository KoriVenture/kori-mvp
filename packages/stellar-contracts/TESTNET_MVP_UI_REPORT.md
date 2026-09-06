# Kori V1 UI and Testnet verification

Verified on `2026-09-06` against Stellar Testnet. This report covers the
three-SPV application slice; the earlier adversarial contract campaign remains
in [`TESTNET_ASSURANCE_REPORT.md`](./TESTNET_ASSURANCE_REPORT.md).

## Result

The application now exposes one real escrow per SPV and the complete V1
transaction surface: fund → evidence → approval → weighted release, plus the
deadline-refund branch. Contract state, amounts, immutable roles, deadlines, and
escrow balances are read from the selected contract or official USDC SAC. The
expected release signer policy comes from the reviewed deployment manifest and
is ultimately enforced by the Stellar G-account.

| SPV | Contract | Live state | Accounted / SAC balance |
| --- | --- | --- | --- |
| Kigali | [`CBFW…OJTV`](https://stellar.expert/explorer/testnet/contract/CBFWI4HBRQUXCARAADDGIYK355CQB3LUGC5EBX5LSC4EVWTRWYO2OJTV) | `Funded` | 5 / 5 USDC |
| Kingston | [`CDIO…T75W`](https://stellar.expert/explorer/testnet/contract/CDIO5OOUS53NHT4IO6IVZDDK5VILKAKPTCVWFQDFPDYJSWIYESLOT75W) | `FundingOpen` | 1 / 1 USDC held; 5 USDC target |
| Accra | [`CAVX…SBQY`](https://stellar.expert/explorer/testnet/contract/CAVXSTQ53IEPBQMTPXQHPWE56KYHRK3VTOPHYT5DR4ZRCZUP7I4SSBQY) | `FundingOpen`, funding deadline elapsed | 1 / 1 USDC held; refund trigger intentionally pending |

Read-only CLI simulation independently returned those states and base-unit
balances. Accra remains `FundingOpen` until any wallet submits `open_refunds` or
`claim_refund`; time passing alone cannot execute a Soroban transaction.

## Deployment evidence

- Official Circle Testnet USDC SAC:
  `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`.
- Optimized Wasm SHA-256:
  `c997029a0f411837ad0f09b48b390b84ec4a40cc98df3173ec122971b9b09263`.
- Kigali deploy/fund transactions:
  [`787b11…c01a`](https://stellar.expert/explorer/testnet/tx/787b112e43a3de89cac92d1ebddf5716087a409b7665ece19be4d325bc63c01a),
  [`bb2f78…b1be6`](https://stellar.expert/explorer/testnet/tx/bb2f788853048fb5c017c5156a9b8bb43e0b4fb8d3427905cd9ec7cf3f9b1be6).
- Kingston deploy/fund transactions:
  [`13c4d7…a797`](https://stellar.expert/explorer/testnet/tx/13c4d7ecaa71686d9c09b6c085bd7ba2a805c556fb4c3042fbea526052f6a797),
  [`95d43c…5f35`](https://stellar.expert/explorer/testnet/tx/95d43cb98e4fd1ee14e37a1cf5998215397eac460e02b7e2bd6b16b0ae275f35).
- Accra deploy/fund transactions:
  [`268b55…ae37`](https://stellar.expert/explorer/testnet/tx/268b5570e5b120ca44a82fbb9486cbe1ecf64f7fe3e035843989b77e40a0ae37),
  [`785b75…722f`](https://stellar.expert/explorer/testnet/tx/785b7516b57eba385479b3263a3a9c684323be141c33ed075a85df952798722f).
- Full constructor data and weighted-account configuration transactions:
  [`deployments/testnet-mvp-ui-v1.json`](./deployments/testnet-mvp-ui-v1.json).
- Kigali uses a dedicated startup account, distinct from the Fund Manager,
  release authority, and all release signers.

## Application checks

- Chromium loaded `/demo/stellar` and fetched all three contracts without a
  console error.
- Deal selection changed contract, state, funded amount, SAC balance, role data,
  and deadline data correctly.
- Desktop and 390 × 844 responsive layouts were inspected.
- Missing Freighter produced an explicit install/unlock message.
- The Vercel `kori-mvp-web` project stores all three public escrow IDs as Config
  variables for Production, Preview, Development, and staging.
- Horizon re-verification confirmed release threshold `3`, high threshold `4`,
  master weight `0`, and signer weights `1 + 2 + 1`.
- Client tests bind release XDR to one contract, one method, the approved
  evidence hash/version, exact amount, source account, finite expiry, bounded
  fee, unmodified transaction body, and real signer signatures.
- Evidence tests cover deterministic canonicalization, hash matching, malformed
  imports, invalid dates/fields, count limits, and aggregate size limits.

Run results are recorded by the pull request CI/local verification. The
expected local baseline is 23 Rust contract tests and 53 Next/client tests,
plus passing TypeScript, ESLint with no errors, production build, Cargo fmt,
Clippy, Rustdoc, and optimized Wasm build.

## Deliberate demo state and limits

Kigali is intentionally left before evidence, Kingston before full funding, and
Accra before the refund trigger so the team can demonstrate each branch through
Freighter. Automated Chromium cannot load a user-installed wallet extension;
therefore a fresh multi-wallet UI rehearsal and role signatures remain explicit
presenter actions, not claimed browser-automation results. The underlying
contract lifecycle and both weighted signer combinations were already exercised
in the broader Testnet assurance campaign.

Evidence manifests are local/exported JSON and source files are not uploaded.
Supabase evidence storage, durable transaction/event projection, replay after a
closed browser, AI advisory, and a deal factory are deferred. No private key is
committed. This Testnet verification is not a security audit or Mainnet
approval.
