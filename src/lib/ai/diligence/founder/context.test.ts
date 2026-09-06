import assert from "node:assert/strict";
import { test } from "node:test";
import { buildFounderDiligenceAiContext } from "./context";

test("founder AI context excludes raw storage paths and terms", () => {
  const context = buildFounderDiligenceAiContext({
    room: { id: "r", code: "R", status: "active_review", readinessScore: 1 },
    startup: { id: "s", displayName: "Startup", legalName: "Startup Ltd", sector: "Tech" },
    deal: { id: "d", round: "Seed", targetAmount: 10, currency: "USDC", termSheetStage: "proposed_terms" },
    termSheet: { investment: { amount: 10, currency: "USDC" }, instrument: null, preMoneyValuation: null, investorRights: null, governance: null, milestoneCount: 0, vehicle: null, jurisdiction: null, rawTerms: { secret: true } },
    workstreams: [], state: { resolved: 0, total: 0, awaitingFounder: 0, clarificationRequested: 0, awaitingReview: 0 }, requests: [], startupDocuments: [], closingChecklist: [], viewer: { userId: "u", displayName: "Founder", initials: "F", photoUrl: null },
  });
  assert.equal("rawTerms" in context.termSheet, false);
  assert.equal("storagePath" in context, false);
});
