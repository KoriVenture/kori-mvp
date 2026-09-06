import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

test("the real diligence orchestrator preserves its initial DOM and interactions", () => {
  const result = spawnSync(process.execPath, [
    "--experimental-strip-types",
    "--experimental-test-module-mocks",
    "--loader",
    fileURLToPath(new URL("../../../test/diligence-tsx-loader.mjs", import.meta.url)),
    "--test",
    fileURLToPath(new URL("./diligence-interaction.fixture.ts", import.meta.url)),
  ], {
    encoding: "utf8",
    env: { ...process.env, NODE_TEST_CONTEXT: undefined },
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
