import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const authSource = readFileSync(
  fileURLToPath(new URL("./auth.ts", import.meta.url)),
  "utf8",
);

test("diligence room authorization starts from the server investor role", () => {
  assert.match(authSource, /requireRole\(\s*["']investor["']\s*\)/);
});

test("diligence room membership is scoped to the active server-derived user", () => {
  assert.match(authSource, /\.eq\(\s*["']room_id["']\s*,\s*roomId\s*\)/);
  assert.match(authSource, /\.eq\(\s*["']user_id["']\s*,\s*userId\s*\)/);
  assert.match(authSource, /\.eq\(\s*["']status["']\s*,\s*["']active["']\s*\)/);
});

test("lead reviewer authorization checks the active membership role", () => {
  assert.match(
    authSource,
    /membership\.role\s*!==\s*["']lead_reviewer["']/,
  );
});

test("diligence room authorization does not use a service-role credential", () => {
  assert.doesNotMatch(authSource, /service[_-]?role/i);
});
