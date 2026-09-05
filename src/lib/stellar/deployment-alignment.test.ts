import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  KORI_DEMO_DEAL,
  KORI_NAMED_DEMO_INVESTORS,
} from "./demo-config.ts";

type DeploymentManifest = {
  contractId: string;
  asset: { sacAddress: string };
  configuration: {
    targetAmountBaseUnits: string;
    fundingDeadline: number;
    releaseDeadline: number;
  };
  demoInvestors: Array<{ publicKey: string }>;
};

test("the frontend configuration matches the committed Testnet manifest", () => {
  const manifest = JSON.parse(
    readFileSync(
      resolve(
        process.cwd(),
        "packages/stellar-contracts/deployments/testnet-web3-demo-v1.json",
      ),
      "utf8",
    ),
  ) as DeploymentManifest;

  assert.equal(KORI_DEMO_DEAL.contractId, manifest.contractId);
  assert.equal(KORI_DEMO_DEAL.usdcSac, manifest.asset.sacAddress);
  assert.equal(
    KORI_DEMO_DEAL.targetBaseUnits.toString(),
    manifest.configuration.targetAmountBaseUnits,
  );
  assert.equal(
    KORI_DEMO_DEAL.fundingDeadline,
    manifest.configuration.fundingDeadline,
  );
  assert.equal(
    KORI_DEMO_DEAL.releaseDeadline,
    manifest.configuration.releaseDeadline,
  );
  assert.deepEqual(
    KORI_NAMED_DEMO_INVESTORS.map(({ address }) => address),
    manifest.demoInvestors.map(({ publicKey }) => publicKey),
  );
});
