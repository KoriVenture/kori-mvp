# Kori V1 Testnet demo runbook

The same live lifecycle is available at public `/demo/stellar` and, after Kori
onboarding, at `/dashboard`. It uses three deployed `DealEscrow` contracts and
official Circle Stellar Testnet USDC. There is no KYC or AI step.

## Demo state

| SPV | Contract | Intended starting point |
| --- | --- | --- |
| Logistic Transport Kigali | [`CBFW…OJTV`](https://stellar.expert/explorer/testnet/contract/CBFWI4HBRQUXCARAADDGIYK355CQB3LUGC5EBX5LSC4EVWTRWYO2OJTV) | `Funded`, 5/5 USDC; evidence → approval → release |
| Solar Grid Kingston | [`CDIO…T75W`](https://stellar.expert/explorer/testnet/contract/CDIO5OOUS53NHT4IO6IVZDDK5VILKAKPTCVWFQDFPDYJSWIYESLOT75W) | `FundingOpen`, 1/5 USDC; open funding |
| Agro-processing Accra | [`CAVX…SBQY`](https://stellar.expert/explorer/testnet/contract/CAVXSTQ53IEPBQMTPXQHPWE56KYHRK3VTOPHYT5DR4ZRCZUP7I4SSBQY) | Underfunded after deadline; refund path |

Exact addresses, transactions, roles, deadlines, and Wasm hash are in
[`deployments/testnet-mvp-ui-v1.json`](./deployments/testnet-mvp-ui-v1.json).

## Start locally

```bash
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000/demo/stellar`. Supabase is not required for this
route. Requirements for transactions: unlocked Freighter on **Testnet**, XLM
for fees, and—when funding—the Circle Testnet USDC trustline and balance.

## Run the cycle

1. **Fund:** select Kingston, connect any Testnet wallet, enter an amount within
   remaining capacity, then sign. The UI waits for `SUCCESS` and refreshes the
   contract and SAC balances.
2. **Evidence:** select Kigali and connect its configured startup wallet. Write
   a statement, optionally choose files, build/download the canonical manifest,
   then sign `submit_evidence`. Files are hashed locally and never uploaded.
3. **Approve:** send the manifest JSON to the configured Fund Manager. They
   connect, import it, verify the anchored SHA-256 hash, and sign approval.
4. **Release:** prepare the exact 15-minute XDR package. Fadjiah + Lionel is
   the normal signer pair; Kori + Lionel is recovery. Exchange/import the JSON
   package between signers, then submit after verified weight reaches 3/3.
5. **Refund:** select Accra. Any connected Testnet wallet may open refunds or
   return the recorded contribution to its original investor address; the
   caller cannot redirect it.

Each successful action appears under **Confirmed this session** with a
transaction hash and ledger link. A wallet prompt, signature, or submitted hash
alone is not success.

## Boundaries

- One immutable escrow per SPV; one milestone and one full release per escrow.
- Exact target funding is enforced by each contract, not by frontend copy.
- Role-restricted actions require the exact configured G-account.
- Private keys are never stored in this repository or sent to Kori.
- Evidence sharing is manual for this demo. Supabase object storage and the
  idempotent event/indexer projection are deferred.
- Testnet success is not a security audit or Mainnet approval.

Run the automated checks with `npm test` and the contract checks documented in
[`README.md`](./README.md). See [`TESTNET_MVP_UI_REPORT.md`](./TESTNET_MVP_UI_REPORT.md)
for verified results and known limitations.
