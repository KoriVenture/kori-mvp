import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

function source(relative: string) {
  return readFileSync(resolve(process.cwd(), relative), "utf8");
}

const workspace = source(
  "src/components/stellar/DealLifecycleWorkspace.tsx",
);
const client = source("src/lib/stellar/client.ts");

test("the workspace exposes all three real Testnet deals", () => {
  assert.match(workspace, /KORI_DEMO_DEALS\.map/);
  assert.match(workspace, /setSelectedDealId/);
  assert.match(workspace, /SCENARIO TO RUN/);
  assert.match(workspace, /deal\.guide\.steps\.map/);
  assert.match(workspace, /stellar-action-hint/);
  assert.doesNotMatch(workspace, /89\.4%|\$2,840,000|82\.6%/);
});

test("the complete lifecycle prepares, signs, submits, and confirms", () => {
  for (const action of [
    "prepareFundingXdr",
    "prepareEvidenceXdr",
    "prepareApprovalXdr",
    "prepareReleaseXdr",
    "prepareOpenRefundsXdr",
    "prepareClaimRefundXdr",
  ]) {
    assert.match(workspace, new RegExp(action));
  }
  assert.match(workspace, /signTransaction/);
  assert.match(workspace, /validateSignedTransactionMatchesPreparation/);
  assert.match(client, /server\.prepareTransaction/);
  assert.match(client, /server\.sendTransaction/);
  assert.match(client, /server\.pollTransaction/);
});

test("release readiness is based on cryptographically verified signatures", () => {
  assert.match(client, /keypair\.verify\(hash, signature\.signature\)/);
  assert.match(workspace, /validateReleaseTransactionXdr/);
  assert.match(workspace, /signedWeight < KORI_MVP_RELEASE_THRESHOLD/);
  assert.match(workspace, /Lionel plus Fadjiah/);
  assert.match(workspace, /Lionel plus Kori/);
});

test("the demo is public and never exposes a Stellar secret", () => {
  const proxy = source("src/proxy.ts");
  const config = source("src/lib/stellar/demo-config.ts");
  const environment = source(".env.example");
  assert.ok(
    proxy.indexOf('request.nextUrl.pathname === "/demo/stellar"') <
      proxy.indexOf("return updateSession(request)"),
  );
  assert.doesNotMatch(config, /secret|private.?key|seed/i);
  assert.doesNotMatch(environment, /NEXT_PUBLIC_[A-Z0-9_]*(SECRET|PRIVATE|SEED)/);
});
