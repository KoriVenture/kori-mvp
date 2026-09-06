import assert from "node:assert/strict";
import { test } from "node:test";
import { deriveFounderDiligenceState, normalizeFounderWorkstreamKey } from "./types";

test("normalizes legacy workstreams", () => {
  assert.equal(normalizeFounderWorkstreamKey("market_customer"), "market");
  assert.equal(normalizeFounderWorkstreamKey("financial_model"), "financial");
  assert.equal(normalizeFounderWorkstreamKey("product_technology"), "product_tech");
  assert.equal(normalizeFounderWorkstreamKey("legal_governance"), "legal_regulatory");
});

test("derives founder diligence state", () => {
  const state = deriveFounderDiligenceState([
    { status: "open" }, { status: "response_submitted" }, { status: "clarification_requested" }, { status: "resolved" }, { status: "cancelled" },
  ]);
  assert.deepEqual(state, { resolved: 1, total: 4, awaitingFounder: 1, clarificationRequested: 1, awaitingReview: 1 });
});
