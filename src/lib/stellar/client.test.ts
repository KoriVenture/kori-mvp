import assert from "node:assert/strict";
import test from "node:test";

import {
  Account,
  BASE_FEE,
  Contract,
  Keypair,
  Memo,
  TransactionBuilder,
  nativeToScVal,
  xdr,
} from "@stellar/stellar-sdk";

import { KORI_DEMO_DEALS, STELLAR_TESTNET } from "./demo-config.ts";
import {
  type DealSnapshot,
  validateReleaseTransactionXdr,
  validateSignedTransactionMatchesPreparation,
  verifyReleaseSignatures,
} from "./client.ts";

const deal = KORI_DEMO_DEALS[0];
const evidenceHash = "11".repeat(32);
const evidenceBytes = Uint8Array.from(
  evidenceHash.match(/.{2}/g) ?? [],
  (pair) => Number.parseInt(pair, 16),
);
const snapshot: DealSnapshot = {
  contractId: deal.contractId,
  observedAtTimestamp: 1,
  state: "Approved",
  asset: "asset",
  startup: deal.startup,
  fundManager: deal.fundManager,
  releaseAuthority: deal.releaseAuthority,
  totalFundedBaseUnits: 50_000_000n,
  totalReleasedBaseUnits: 0n,
  totalRefundedBaseUnits: 0n,
  escrowBalanceBaseUnits: 50_000_000n,
  targetBaseUnits: 50_000_000n,
  fundingDeadline: 2,
  releaseDeadline: 3,
  evidence: null,
  approval: {
    hashHex: evidenceHash,
    version: 1,
    releaseAmountBaseUnits: 50_000_000n,
    approvedAtLedger: 1,
    approvedAtTimestamp: 1,
  },
  refundReason: null,
};

function releaseXdr(
  contractId = deal.contractId,
  amount = 50_000_000n,
  options: { fee?: string; timeout?: number; memo?: string } = {},
) {
  const builder = new TransactionBuilder(new Account(deal.releaseAuthority, "1"), {
    fee: options.fee ?? BASE_FEE,
    networkPassphrase: STELLAR_TESTNET.networkPassphrase,
  })
    .addOperation(
      new Contract(contractId).call(
        "release",
        xdr.ScVal.scvBytes(evidenceBytes),
        nativeToScVal(1, { type: "u32" }),
        nativeToScVal(amount, { type: "i128" }),
      ),
    );
  if (options.memo) builder.addMemo(Memo.text(options.memo));
  return builder.setTimeout(options.timeout ?? 300).build();
}

test("release package validation binds contract, evidence version, and amount", () => {
  assert.doesNotThrow(() =>
    validateReleaseTransactionXdr(releaseXdr().toXDR(), deal, snapshot),
  );
  assert.throws(
    () =>
      validateReleaseTransactionXdr(
        releaseXdr(KORI_DEMO_DEALS[1].contractId).toXDR(),
        deal,
        snapshot,
      ),
    /targets another contract/,
  );
  assert.throws(
    () => validateReleaseTransactionXdr(releaseXdr(deal.contractId, 1n).toXDR(), deal, snapshot),
    /does not match/,
  );
  assert.throws(
    () =>
      validateReleaseTransactionXdr(
        releaseXdr(deal.contractId, 50_000_000n, {
          fee: "10000001",
        }).toXDR(),
        deal,
        snapshot,
      ),
    /fee exceeds/,
  );
  assert.throws(
    () =>
      validateReleaseTransactionXdr(
        releaseXdr(deal.contractId, 50_000_000n, {
          timeout: 30 * 60,
        }).toXDR(),
        deal,
        snapshot,
      ),
    /expiry exceeds/,
  );
  assert.throws(
    () =>
      validateReleaseTransactionXdr(
        releaseXdr(deal.contractId, 50_000_000n, {
          memo: "unexpected",
        }).toXDR(),
        deal,
        snapshot,
      ),
    /cannot contain a memo/,
  );
});

test("release signer detection verifies real envelope signatures", () => {
  const signer = Keypair.random();
  const transaction = releaseXdr();
  transaction.sign(signer);
  const verified = verifyReleaseSignatures(transaction.toXDR(), [
    {
      role: "test",
      label: "Valid signer",
      address: signer.publicKey(),
      weight: 2,
    },
    {
      role: "test",
      label: "Unsigned account",
      address: Keypair.random().publicKey(),
      weight: 1,
    },
  ]);
  assert.deepEqual(verified.map(({ label }) => label), ["Valid signer"]);
});

test("a wallet may add signatures but cannot replace the prepared invocation", () => {
  const prepared = releaseXdr();
  const signed = TransactionBuilder.fromXDR(
    prepared.toXDR(),
    STELLAR_TESTNET.networkPassphrase,
  );
  if ("innerTransaction" in signed) throw new Error("Unexpected fee bump.");
  signed.sign(Keypair.random());

  assert.doesNotThrow(() =>
    validateSignedTransactionMatchesPreparation(
      prepared.toXDR(),
      signed.toXDR(),
    ),
  );
  assert.throws(
    () =>
      validateSignedTransactionMatchesPreparation(
        prepared.toXDR(),
        releaseXdr(deal.contractId, 1n).toXDR(),
      ),
    /differs from the prepared action/,
  );
});
