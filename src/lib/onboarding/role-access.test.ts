import assert from "node:assert/strict";
import test from "node:test";

import { hasRole } from "./role-access.ts";

test("hasRole permits only an explicitly assigned public role", () => {
  assert.equal(hasRole(["investor"], "investor"), true);
  assert.equal(hasRole(["investor"], "founder"), false);
  assert.equal(hasRole("investor", "investor"), false);
  assert.equal(hasRole(null, "founder"), false);
});
