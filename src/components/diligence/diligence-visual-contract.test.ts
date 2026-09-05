import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = new URL("../../../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

test("the locked CSS preserves every Annex B byte, token, dimension and ascending breakpoint", () => {
  const css = read("src/app/globals.css");
  const block = css.split("/* BEGIN KORI EXACT COLLABORATIVE DUE DILIGENCE */\n")[1]?.split("/* END KORI EXACT COLLABORATIVE DUE DILIGENCE */")[0];
  assert.ok(block, "the canonical diligence CSS block must exist");
  // SHA-256 of the complete normative Annex B CSS, including its trailing blank line.
  // Pin the embedded source without depending on an untracked execution artifact.
  assert.equal(createHash("sha256").update(block).digest("hex"), "40fc4ebac7203149f11d0f35a4115e38dfc8b485cc821720bc1fc92fe2555bd6");
  for (const token of ["--ink:#101918", "--muted:#65706d", "--line:#d9ddd6", "--paper:#f3f2ec", "--accent:#b84e3e", "grid-template-columns:224px minmax(0,1fr)", "min-height:92px", "max-width:1360px", "padding:44px 42px 80px", "background:#13211f", "background:#f8f7f2", "@media(min-width:761px)", "@media(min-width:1051px)"])
    assert.ok(block.includes(token), token);
  assert.doesNotMatch(block, /@media[^{}]*(?:max-width|width\s*<=|\d(?:px|rem|em)\s*>=\s*width)/i);
});

test("production runtime cannot import the visual fixture and the harness is production guarded", () => {
  const walk = (path: string): string[] => readdirSync(new URL(path, root), { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(`${path}/${entry.name}`) : [`${path}/${entry.name}`]);
  for (const path of walk("src").filter((path) => /\.[tj]sx?$/.test(path) && !/\.(test|fixture)\.tsx?$/.test(path) && !path.includes("visual-tests/") && !path.endsWith("visual-fixture.ts"))) {
    assert.doesNotMatch(read(path), /(?:from\s*|import\s*\()["'][^"']*visual-fixture/, path);
  }
  assert.ok(read("src/lib/diligence/visual-fixture.ts").startsWith("/** VISUAL TEST ONLY. NEVER IMPORT FROM PRODUCTION PAGE OR API. */"));
  assert.match(read("src/app/visual-tests/diligence/page.tsx"), /if \(process\.env\.NODE_ENV === "production"\) notFound\(\);/);
});

test("actual component trees preserve all five canonical views, DTO mapping and interactions", () => {
  const result = spawnSync(process.execPath, ["--experimental-strip-types", "--experimental-test-module-mocks", "--loader", fileURLToPath(new URL("test/diligence-tsx-loader.mjs", root)), "--test", fileURLToPath(new URL("./diligence-interaction.fixture.ts", import.meta.url))], { encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
