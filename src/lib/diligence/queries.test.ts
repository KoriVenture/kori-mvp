import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

test("production diligence loader authorization, aggregate and query failures", () => {
  const result = spawnSync(process.execPath, [
    "--experimental-strip-types", "--experimental-test-module-mocks", "--test",
    fileURLToPath(new URL("./queries.fixture.ts", import.meta.url)),
  ], { encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
