import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  KORI_DEMO_DEALS,
  KORI_MVP_RELEASE_SIGNERS,
  STELLAR_TESTNET_USDC,
} from "./demo-config.ts";

type DeploymentManifest = {
  asset: { issuer: string; sacAddress: string; decimals: number };
  releasePolicy: {
    account: string;
    signers: Array<{ publicKey: string; weight: number }>;
  };
  deals: Array<{
    id: string;
    contractId: string;
    startup: string;
    fundManager: string;
    releaseAuthority: string;
    targetAmountBaseUnits: string;
    fundingDeadline: number;
    releaseDeadline: number;
  }>;
};

test("all three frontend deals match the committed Testnet manifest", () => {
  const manifest = JSON.parse(
    readFileSync(
      resolve(
        process.cwd(),
        "packages/stellar-contracts/deployments/testnet-mvp-ui-v1.json",
      ),
      "utf8",
    ),
  ) as DeploymentManifest;

  assert.equal(KORI_DEMO_DEALS.length, 3);
  assert.deepEqual(
    STELLAR_TESTNET_USDC,
    {
      code: "USDC",
      issuer: manifest.asset.issuer,
      sacAddress: manifest.asset.sacAddress,
      decimals: manifest.asset.decimals,
    },
  );
  assert.deepEqual(
    KORI_DEMO_DEALS.map(
      ({ id, contractId, startup, fundManager, releaseAuthority }) => ({
        id,
        contractId,
        startup,
        fundManager,
        releaseAuthority,
      }),
    ),
    manifest.deals.map(
      ({ id, contractId, startup, fundManager, releaseAuthority }) => ({
        id,
        contractId,
        startup,
        fundManager,
        releaseAuthority,
      }),
    ),
  );
  for (const manifestDeal of manifest.deals) {
    assert.equal(BigInt(manifestDeal.targetAmountBaseUnits) > 0n, true);
    assert.equal(manifestDeal.fundingDeadline < manifestDeal.releaseDeadline, true);
  }
  assert.equal(new Set(KORI_DEMO_DEALS.map(({ contractId }) => contractId)).size, 3);
  assert.equal(
    KORI_DEMO_DEALS.every(({ releaseAuthority }) => releaseAuthority === manifest.releasePolicy.account),
    true,
  );
  assert.deepEqual(
    KORI_MVP_RELEASE_SIGNERS.map(({ address, weight }) => ({ publicKey: address, weight })),
    manifest.releasePolicy.signers.map(({ publicKey, weight }) => ({ publicKey, weight })),
  );
  const releaseSignerAddresses = new Set(
    manifest.releasePolicy.signers.map(({ publicKey }) => publicKey),
  );
  for (const deal of manifest.deals) {
    assert.notEqual(deal.startup, deal.fundManager);
    assert.notEqual(deal.startup, deal.releaseAuthority);
    assert.equal(releaseSignerAddresses.has(deal.startup), false);
  }
});
