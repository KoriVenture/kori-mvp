import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

function runFixture(name: string, options: string[] = []) {
  return spawnSync(process.execPath, [
    "--experimental-strip-types",
    "--experimental-test-module-mocks",
    ...options,
    "--test",
    fileURLToPath(new URL(name, import.meta.url)),
  ], {
    encoding: "utf8",
    env: { ...process.env, NODE_TEST_CONTEXT: undefined },
  });
}

test("the real production page shares its loader and renders exact metadata and props", () => {
  const result = runFixture("./diligence-page.fixture.ts", [
    "--loader",
    fileURLToPath(new URL("../../../test/diligence-tsx-loader.mjs", import.meta.url)),
  ]);

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("the room GET endpoint validates and returns the aggregate boundary", () => {
  const result = runFixture("./room-entrypoints.fixture.ts");

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
