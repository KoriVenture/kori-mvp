import assert from "node:assert/strict";
import test from "node:test";
import {
  buildActivity,
  buildSignals,
  evidenceStatusLabel,
  evidenceSummary,
  mapDiligenceRoom,
  recommendationDecisionLabel,
  riskSeverityLabel,
  workstreamProgress,
  workstreamStatus,
  workstreamStatusLabel,
} from "./mappers.ts";
import type { DiligenceRoomRows } from "./mappers.ts";

import {
  buildStartupDescriptor,
  formatCompactCurrency,
  formatRelativeUpdatedAt,
  formatRoomClose,
  initials,
} from "./format.ts";

test("initials uses the first letters of the first two name parts", () => {
  assert.equal(initials("  Amara   Diallo  "), "AD");
  assert.equal(initials("Amara"), "A");
  assert.equal(initials("   "), "");
});

test("compact currency formats 2,400,000 USD as $2.4M", () => {
  assert.equal(formatCompactCurrency(2_400_000, "USD"), "$2.4M");
});

test("room close uses the specified day-month-year format", () => {
  assert.equal(
    formatRoomClose("2026-09-18T12:00:00.000Z"),
    "18 Sep 2026",
  );
});

test("room close returns the empty-state value for an invalid date", () => {
  assert.equal(formatRoomClose("not-a-date"), "—");
});

test("relative updates under 24 hours use whole elapsed hours", () => {
  assert.equal(
    formatRelativeUpdatedAt(
      "2026-09-18T09:00:00.000Z",
      new Date("2026-09-18T15:00:00.000Z"),
    ),
    "6h ago",
  );
});

test("relative updates from the previous day say Yesterday", () => {
  assert.equal(
    formatRelativeUpdatedAt(
      "2026-09-17T13:00:00.000Z",
      new Date("2026-09-18T15:00:00.000Z"),
    ),
    "Yesterday",
  );
});

test("older relative updates use whole elapsed days", () => {
  assert.equal(
    formatRelativeUpdatedAt(
      "2026-09-15T15:00:00.000Z",
      new Date("2026-09-18T15:00:00.000Z"),
    ),
    "3 days ago",
  );
});

test("relative updates return the empty-state value for an invalid date", () => {
  assert.equal(
    formatRelativeUpdatedAt(
      "not-a-date",
      new Date("2026-09-18T15:00:00.000Z"),
    ),
    "—",
  );
});

test("startup descriptor includes only supplied location parts", () => {
  assert.equal(
    buildStartupDescriptor("Climate tech", "Dakar", "Senegal"),
    "Climate tech · Dakar, Senegal",
  );
  assert.equal(
    buildStartupDescriptor("Climate tech", null, "Senegal"),
    "Climate tech · Senegal",
  );
  assert.equal(
    buildStartupDescriptor("Climate tech", "Dakar", null),
    "Climate tech · Dakar",
  );
  assert.equal(buildStartupDescriptor(null, null, null), "");
});

test("progress divides resolved requests by every request and returns zero for none", () => {
  assert.equal(workstreamProgress([]), 0);
  assert.equal(workstreamProgress([{ status: "cancelled" }]), 0);
  assert.equal(workstreamProgress([{ status: "resolved" }, { status: "cancelled" }]), 50);
  assert.equal(workstreamProgress([{ status: "resolved" }, { status: "needs_response" }, { status: "open" }, { status: "open" }]), 25);
});

test("evidence summary excludes cancelled requests", () => {
  assert.deepEqual(evidenceSummary([{ status: "resolved" }, { status: "resolved" }, { status: "needs_response" }, { status: "cancelled" }]), { resolved: 2, total: 3 });
});

test("active critical risk blocks even when evidence and high risks require review", () => {
  for (const status of ["open", "under_review"] as const) {
    assert.equal(workstreamStatus([{ status: "missing" }], [{ severity: "high", status: "open" }, { severity: "critical", status }]), "Blocked");
  }
});

test("missing or needs-response evidence and active high risk require review", () => {
  assert.equal(workstreamStatus([{ status: "missing" }], []), "Review");
  assert.equal(workstreamStatus([{ status: "needs_response" }], []), "Review");
  assert.equal(workstreamStatus([], [{ severity: "high", status: "open" }]), "Review");
  assert.equal(workstreamStatus([], [{ severity: "high", status: "under_review" }]), "Review");
});

test("resolved risks and medium risks do not prevent Clear", () => {
  assert.equal(workstreamStatus([], []), "Clear");
  assert.equal(workstreamStatus([{ status: "verified" }], [
    { severity: "critical", status: "closed" },
    { severity: "critical", status: "accepted" },
    { severity: "critical", status: "mitigated" },
    { severity: "high", status: "closed" },
    { severity: "medium", status: "open" },
  ]), "Clear");
});

test("database enums map to every exact visual label", () => {
  assert.equal(workstreamStatusLabel("clear"), "Clear");
  assert.equal(workstreamStatusLabel("review"), "Review");
  assert.equal(workstreamStatusLabel("blocked"), "Blocked");
  assert.equal(evidenceStatusLabel("verified"), "Verified");
  assert.equal(evidenceStatusLabel("needs_response"), "Needs response");
  assert.equal(evidenceStatusLabel("missing"), "Missing");
  assert.equal(riskSeverityLabel("critical"), "Critical");
  assert.equal(riskSeverityLabel("high"), "High");
  assert.equal(riskSeverityLabel("medium"), "Medium");
  assert.equal(recommendationDecisionLabel("proceed"), "Proceed");
  assert.equal(recommendationDecisionLabel("proceed_with_conditions"), "Proceed with conditions");
  assert.equal(recommendationDecisionLabel("pause_diligence"), "Pause diligence");
  assert.equal(recommendationDecisionLabel("decline"), "Decline");
});

test("signals select latest matching data, prefer a claim and cap at three in visual order", () => {
  assert.deepEqual(buildSignals([
    { id: "evidence-1", status: "verified", title: "Old title", claim: "Old claim", updated_at: "2026-09-01T00:00:00Z" },
    { id: "evidence-2", status: "needs_response", title: "Confirm ARR", claim: null, updated_at: "2026-09-03T00:00:00Z" },
    { id: "evidence-3", status: "verified", title: "Bank data", claim: "Revenue matches bank records", updated_at: "2026-09-04T00:00:00Z" },
    { id: "evidence-4", status: "needs_response", title: "Old response", claim: null, updated_at: "2026-09-02T00:00:00Z" },
  ], [
    { id: "risk-1", severity: "high", status: "open", title: "High risk title", updated_at: "2026-09-05T00:00:00Z" },
    { id: "risk-2", severity: "critical", status: "under_review", title: "Unassigned IP", updated_at: "2026-09-04T00:00:00Z" },
    { id: "risk-3", severity: "critical", status: "closed", title: "Closed risk", updated_at: "2026-09-06T00:00:00Z" },
    { id: "risk-4", severity: "critical", status: "open", title: "Older critical", updated_at: "2026-09-01T00:00:00Z" },
  ]), [
    { kind: "Positive", message: "Revenue matches bank records" },
    { kind: "Watch", message: "Confirm ARR" },
    { kind: "Critical", message: "Unassigned IP" },
  ]);
});

test("signals use titles for absent claims and high-risk fallback, with no invented empty data", () => {
  assert.deepEqual(buildSignals([], []), []);
  assert.deepEqual(buildSignals([
    { id: "evidence-1", status: "verified", title: "Signed contract", claim: null, updated_at: "2026-09-01T00:00:00Z" },
  ], [
    { id: "risk-1", severity: "high", status: "open", title: "Old concentration", updated_at: "2026-09-01T00:00:00Z" },
    { id: "risk-2", severity: "high", status: "under_review", title: "Customer concentration", updated_at: "2026-09-03T00:00:00Z" },
  ]), [{ kind: "Positive", message: "Signed contract" }, { kind: "Watch", message: "Customer concentration" }]);
});

test("signals break equal evidence and critical-risk timestamps by greatest ID", () => {
  assert.deepEqual(buildSignals([
    { id: "evidence-a", status: "verified", title: "Lower positive", claim: null, updated_at: "2026-09-04T00:00:00Z" },
    { id: "evidence-z", status: "verified", title: "Higher positive", claim: null, updated_at: "2026-09-04T00:00:00Z" },
    { id: "response-a", status: "needs_response", title: "Lower watch", claim: null, updated_at: "2026-09-05T00:00:00Z" },
    { id: "response-z", status: "needs_response", title: "Higher watch", claim: null, updated_at: "2026-09-05T00:00:00Z" },
  ], [
    { id: "critical-a", severity: "critical", status: "open", title: "Lower critical", updated_at: "2026-09-06T00:00:00Z" },
    { id: "critical-z", severity: "critical", status: "under_review", title: "Higher critical", updated_at: "2026-09-06T00:00:00Z" },
  ]), [
    { kind: "Positive", message: "Higher positive" },
    { kind: "Watch", message: "Higher watch" },
    { kind: "Critical", message: "Higher critical" },
  ]);
});

test("Watch high-risk fallback breaks equal timestamps by greatest ID", () => {
  assert.deepEqual(buildSignals([], [
    { id: "risk-a", severity: "high", status: "open", title: "Lower high risk", updated_at: "2026-09-05T00:00:00Z" },
    { id: "risk-z", severity: "high", status: "closed", title: "Higher high risk", updated_at: "2026-09-05T00:00:00Z" },
  ]), [{ kind: "Watch", message: "Higher high risk" }]);
});

test("activity counts active members, UTC-today activity and distinct known countries with four avatars", () => {
  const profiles = [
    { id: "a", display_name: "Amara Diallo", country: "Senegal" },
    { id: "b", display_name: "Binta Ba", country: "Senegal" },
    { id: "c", display_name: "Cam Lee", country: "Canada" },
    { id: "d", display_name: null, country: null },
    { id: "e", display_name: "Eve Brown", country: "France" },
    { id: "f", display_name: "Farah Ali", country: "Kenya" },
  ];
  assert.deepEqual(buildActivity([
    { user_id: "f", status: "invited", last_active_at: "2026-09-06T09:00:00Z" },
    { user_id: "f", status: "removed", last_active_at: "2026-09-06T09:00:00Z" },
    { user_id: "a", status: "active", last_active_at: "2026-09-06T00:00:00Z" },
    { user_id: "b", status: "active", last_active_at: "2026-09-06T08:00:00Z" },
    { user_id: "c", status: "active", last_active_at: "2026-09-05T23:30:00-01:00" },
    { user_id: "d", status: "active", last_active_at: "2026-09-06T10:00:00Z" },
    { user_id: "e", status: "active", last_active_at: "2026-09-05T23:59:59Z" },
    { user_id: "absent", status: "active", last_active_at: null },
  ], profiles, new Date("2026-09-06T12:00:00Z")), {
    reviewerCount: 6, activeTodayCount: 4, marketCount: 2,
    avatars: [
      { initials: "AD", displayName: "Amara Diallo" },
      { initials: "BB", displayName: "Binta Ba" },
      { initials: "CL", displayName: "Cam Lee" },
      { initials: "", displayName: "" },
    ],
  });
  assert.deepEqual(buildActivity([], [], new Date("2026-09-06T12:00:00Z")), { reviewerCount: 0, activeTodayCount: 0, marketCount: 0, avatars: [] });
});

const roomRows: DiligenceRoomRows = {
  room: { id: "room", deal_id: "deal", room_code: "DD-26", status: "active_review", closes_at: null, readiness_score: 73 },
  viewerUserId: "viewer", viewerRole: "reviewer",
  deal: { id: "deal", startup_id: "startup", spv_id: null, round: null, target_amount: 2400000, currency: "USD" },
  startup: { id: "startup", display_name: "Example Solar", sector: "Energy", country: "Senegal" },
  leadUserId: null,
  profiles: [{ id: "viewer", display_name: "Ada Cole", photo_url: null, country: "Canada" }],
  workstreams: [{ id: "w1", title: "Legal", owner_user_id: null }, { id: "w2", title: "Product", owner_user_id: "viewer" }],
  requests: [{ workstream_id: "w1", status: "resolved" }, { workstream_id: "w2", status: "open" }],
  evidence: [], risks: [], discussion: [], members: [], latestRecommendation: null,
};

test("room aggregate preserves readiness and nulls, scopes progress and never invents a missing city", () => {
  const dto = mapDiligenceRoom(roomRows, new Date("2026-09-06T12:00:00Z"));
  assert.equal(dto.readinessScore, 73);
  assert.equal(dto.deal.descriptor, "Energy · Senegal");
  assert.equal(dto.deal.companyInitials, "ES");
  assert.equal(dto.deal.round, null);
  assert.equal(dto.deal.leadName, null);
  assert.equal(dto.closesAt, null);
  assert.equal(dto.latestRecommendation, null);
  assert.deepEqual(dto.viewer, { userId: "viewer", displayName: "Ada Cole", initials: "AC", role: "reviewer", photoUrl: null });
  assert.deepEqual(dto.workstreams, [
    { id: "w1", title: "Legal", ownerUserId: null, ownerName: null, progress: 100, status: "Clear" },
    { id: "w2", title: "Product", ownerUserId: "viewer", ownerName: "Ada Cole", progress: 0, status: "Clear" },
  ]);
  assert.deepEqual(dto.evidenceSummary, { resolved: 1, total: 2 });
});
