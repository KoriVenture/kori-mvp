import assert from "node:assert/strict";
import test from "node:test";

import { resolveEmailVerified } from "./auth-state.ts";

test("a live Auth0 false claim overrides a cached verified profile", () => {
  assert.equal(resolveEmailVerified(false, true), false);
});

test("a live Auth0 true claim overrides a cached unverified profile", () => {
  assert.equal(resolveEmailVerified(true, false), true);
});

test("cached verification is used only when Auth0 omits the claim", () => {
  assert.equal(resolveEmailVerified(undefined, true), true);
  assert.equal(resolveEmailVerified(null, false), false);
});
