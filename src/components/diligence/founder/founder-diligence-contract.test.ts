import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("Founder Due Diligence view keeps the approved product copy", () => {
  const source = readFileSync(new URL("./FounderDiligenceTerms.tsx", import.meta.url), "utf8");
  for (const phrase of [
    "Collective Diligence & Term Sheet",
    "Questions investors are working through",
    "From shared conviction to an investment agreement",
    "Term Sheet Summary",
    "Closing Checklist",
    "Kori displays and coordinates the process but does not replace legal counsel or the governing agreements.",
  ]) assert.match(source + readFileSync(new URL("./FounderTermSheetSummary.tsx", import.meta.url), "utf8") + readFileSync(new URL("./FounderClosingChecklist.tsx", import.meta.url), "utf8"), new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});