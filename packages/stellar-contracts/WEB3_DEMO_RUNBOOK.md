# Kori Web3 Testnet demo

This is the narrow frontend-to-Soroban demo path. It funds one active
`DealEscrow` with Circle Testnet USDC and waits for confirmed ledger inclusion.

## Active deployment

- Contract: [`CA4R…FSYY`](https://stellar.expert/explorer/testnet/contract/CA4RSBPJUOOJCHGO77XEL3RURRPWOF6PPEU7CJXASYOL5P5Q7DDEFSYY)
- Deployment transaction: [`80d52c…b311`](https://stellar.expert/explorer/testnet/tx/80d52c6a2d20a42994df7d4c45e097a252b6193766a1ebaa262723b10f88b311)
- Target: `5 USDC`
- Funding deadline: `2026-09-08 23:59 AST`
- Release deadline: `2026-09-15 23:59 AST`
- Manifest: [`deployments/testnet-web3-demo-v1.json`](./deployments/testnet-web3-demo-v1.json)

## Run

Requirements: Node.js `>=22.12`, an unlocked Freighter extension on **Testnet**,
and an approved Testnet-only demo account selected in Freighter. Lionel's demo
wallet `GDTM…KEUQ` was verified with the correct USDC trustline and funded with
2 USDC in transaction [`59f92e…1910`](https://stellar.expert/explorer/testnet/tx/59f92e9f73e9594e01ac078440350918f7b93fd2e32d0d9d458463d26d431910).

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open `/demo/stellar` for the isolated presentation route, or complete investor
onboarding and open `/dashboard`. Then:

1. connect Freighter;
2. confirm the wallet is on Testnet and is an approved demo account;
3. enter an amount that does not exceed the remaining 5 USDC capacity;
4. simulate, inspect, and sign the complete transaction in Freighter;
5. wait for `Confirmed on Testnet`;
6. open the transaction link and compare the displayed ledger with Stellar.

The app never receives a wallet secret key. A successful UI result requires an
RPC `SUCCESS`, not merely transaction submission.

## Verification status

Verified on `2026-09-02`:

- the page loaded `FundingOpen` and `0 / 5 USDC` from the live contract;
- Freighter connected `GDTM…KEUQ` on Testnet as `Lionel Demo`;
- a `1 USDC` call was successfully simulated and reached Freighter's signature
  screen;
- desktop and mobile layouts rendered correctly.

The final Freighter approval remains a manual wallet action. Do not describe a
frontend funding transaction as confirmed until the UI displays its hash and
confirmed ledger.

## Demo boundary

Implemented now:

- live contract-state reads;
- Freighter Testnet network/account checks;
- exact seven-decimal USDC conversion;
- simulation before signature;
- signed `fund` submission;
- `PENDING` to `SUCCESS`/`FAILED` polling;
- transaction hash and confirmed ledger display.

Deferred to the next application iteration:

- durable Supabase transaction projection;
- idempotent contract-event ingestion and replay;
- background recovery when the browser closes after submission;
- deal deployment orchestration/factory;
- evidence, approval, release, and refund screens.

Stellar RPC retains only a bounded recent history. Before production work, add
`contract_deployments`, `chain_transactions`, and `chain_events` projections,
deduplicate events by their unique event ID, and persist the ingestion cursor.
