import assert from "node:assert/strict";
import { test } from "node:test";
import { buildFounderDiligenceAiSystemPrompt } from "./prompt";

test("founder prompt preserves safety requirements", () => {
  const prompt = buildFounderDiligenceAiSystemPrompt({} as never);
  assert.match(prompt, /read-only/i);
  assert.match(prompt, /NEEDS FOUNDER INPUT/i);
  assert.match(prompt, /untrusted data/i);
  assert.match(prompt, /never submits/i);
});
