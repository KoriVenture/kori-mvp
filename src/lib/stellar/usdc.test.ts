import assert from "node:assert/strict";
import test from "node:test";

import { formatUsdc, parseUsdc } from "./usdc.ts";

test("USDC parsing uses Stellar's seven decimal base units", () => {
  assert.equal(parseUsdc("1"), 10_000_000n);
  assert.equal(parseUsdc("1.5"), 15_000_000n);
  assert.equal(parseUsdc("0.0000001"), 1n);
  assert.equal(parseUsdc("5.0000000"), 50_000_000n);
});

test("USDC parsing rejects zero, negatives, excess precision, and text", () => {
  for (const value of ["0", "-1", "0.00000001", "1e2", "USDC 1", ""]) {
    assert.throws(() => parseUsdc(value));
  }
});

test("USDC formatting is concise without losing base-unit precision", () => {
  assert.equal(formatUsdc(50_000_000n), "5");
  assert.equal(formatUsdc(15_000_000n), "1.5");
  assert.equal(formatUsdc(1n), "0.0000001");
  assert.equal(formatUsdc(-1n), "-0.0000001");
});
