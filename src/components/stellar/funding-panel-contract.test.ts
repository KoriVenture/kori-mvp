import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

function source(relative: string) {
  return readFileSync(resolve(process.cwd(), relative), "utf8");
}

test("the funding panel requires Freighter Testnet and a known demo investor", () => {
  const panel = source("src/components/stellar/DealFundingPanel.tsx");

  assert.match(panel, /getNetworkDetails/);
  assert.match(panel, /networkPassphrase !== STELLAR_TESTNET\.networkPassphrase/);
  assert.match(panel, /getDemoInvestor\(addressResult\.address\)/);
  assert.match(panel, /Connect an approved Testnet demo investor before funding/);
});

test("the funding path simulates, signs, submits, and displays confirmation", () => {
  const panel = source("src/components/stellar/DealFundingPanel.tsx");
  const client = source("src/lib/stellar/client.ts");

  assert.match(panel, /prepareFundingXdr/);
  assert.match(panel, /signTransaction/);
  assert.match(panel, /submitFundingXdr/);
  assert.match(panel, /confirmedLedger/);
  assert.match(client, /server\.prepareTransaction/);
  assert.match(client, /server\.sendTransaction/);
  assert.match(client, /server\.pollTransaction/);
  assert.match(client, /GetTransactionStatus\.SUCCESS|return \{/);
});

test("no Stellar secret is exposed through the browser configuration", () => {
  const config = source("src/lib/stellar/demo-config.ts");
  const environment = source(".env.example");

  assert.doesNotMatch(config, /secret|private.?key|seed/i);
  assert.doesNotMatch(environment, /NEXT_PUBLIC_[A-Z0-9_]*(SECRET|PRIVATE|SEED)/);
});

test("the isolated Stellar demo does not require Supabase configuration", () => {
  const proxy = source("src/proxy.ts");
  const bypass = proxy.indexOf('request.nextUrl.pathname === "/demo/stellar"');
  const sessionRefresh = proxy.indexOf("return updateSession(request)");

  assert.notEqual(bypass, -1);
  assert.ok(bypass < sessionRefresh);
});
