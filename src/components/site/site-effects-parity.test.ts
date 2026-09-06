import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

function source(relative: string) {
  const path = resolve(process.cwd(), relative);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

test("site effects preserve every legacy runtime contract", () => {
  const effects = source("src/components/site/SiteEffects.tsx");

  for (const literal of [
    "4200",
    "430",
    "200",
    "190",
    "1900",
    "1200",
    "2400",
    "2800",
    "950",
    "1.6s var(--ease)",
    "#F98515",
    "#F5513E",
    "#049C9F",
    "#0590C6",
    "prefers-reduced-motion",
    "requestAnimationFrame",
    "mousemove",
    "mouseleave",
    "progress",
    "ghostc",
    "[data-bg]",
    ".anim-text-up",
    "[data-draw]",
    "data-team-carousel",
    "aria-expanded",
    "IntersectionObserver",
  ]) {
    assert.ok(effects.includes(literal), `SiteEffects must contain ${literal}`);
  }

  assert.match(effects, /threshold:\s*\.05/);
  assert.match(effects, /rootMargin:\s*["']0px 0px -6% 0px["']/);
  assert.match(effects, /threshold:\s*\.3/);
});

test("SiteFrame renders React-managed effects while preserving effect IDs", () => {
  const frame = source("src/components/SiteFrame.tsx");

  assert.doesNotMatch(frame, /next\/script/);
  assert.doesNotMatch(frame, /\/kori\.js/);
  assert.match(frame, /<SiteEffects\s*\/>/);

  for (const id of ["net", "veil", "ghostc", "cur", "progress"]) {
    assert.match(frame, new RegExp(`id=["']${id}["']`));
  }
});
