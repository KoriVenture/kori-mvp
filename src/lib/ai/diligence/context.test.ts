import assert from "node:assert/strict";
import { test } from "node:test";
import { buildDiligenceAiContext } from "./context";
import type { DiligenceRoomDTO } from "../../diligence/types";

const room = {
  code: "ROOM",
  readinessScore: 50,
  status: "active_review",
  closesAt: null,
  deal: { companyName: "Company", descriptor: "City", round: null, targetAmount: 1, currency: "USD", leadName: null },
  workstreams: [], evidence: [], risks: [], discussion: [], latestRecommendation: null,
} as unknown as DiligenceRoomDTO;

test("context bounds long narrative fields", () => {
  const context = buildDiligenceAiContext({
    ...room,
    evidence: [{ id: "e", title: "Evidence", workstreamId: "w", workstream: "Workstream", status: "Missing", ownerUserId: null, ownerName: null, updatedAt: "today", sourceType: null, sourceUri: null, claim: "x".repeat(2500) }],
  });
  assert.equal(context.evidence[0].claim?.length, 2000);
  assert.equal(context.wasTruncated, true);
});
