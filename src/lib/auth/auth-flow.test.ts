import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

test("Supabase account creation and callback contracts", () => {
  const fixture = fileURLToPath(
    new URL("./auth-flow.fixture.ts", import.meta.url),
  );
  const result = spawnSync(
    process.execPath,
    [
      "--experimental-strip-types",
      "--experimental-test-module-mocks",
      "--test",
      fixture,
    ],
    { encoding: "utf8" },
  );

  assert.equal(
    result.status,
    0,
    `${result.stdout}\n${result.stderr}`,
  );
});
