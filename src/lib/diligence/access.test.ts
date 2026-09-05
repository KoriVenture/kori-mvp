import assert from "node:assert/strict";
import { test } from "node:test";
import { selectDiligenceViewerKind } from "./access";

test("selects the only authorized view", () => {
  assert.equal(selectDiligenceViewerKind(false, true), "founder");
  assert.equal(selectDiligenceViewerKind(true, false), "investor");
});

test("preference selects between authorized views only", () => {
  assert.equal(selectDiligenceViewerKind(true, true, "founder"), "founder");
  assert.equal(selectDiligenceViewerKind(true, true, "investor"), "investor");
  assert.equal(selectDiligenceViewerKind(true, true), "investor");
  assert.equal(selectDiligenceViewerKind(true, false, "founder"), "investor");
  assert.equal(selectDiligenceViewerKind(false, false, "founder"), null);
});
