import assert from "node:assert/strict";
import test from "node:test";

import {
  discussionPayloadSchema,
  invitePayloadSchema,
  inviteTokenSchema,
  messageIdSchema,
  recommendationPayloadSchema,
  requestEvidencePayloadSchema,
  riskCreatePayloadSchema,
  riskIdSchema,
  riskPatchPayloadSchema,
  roomIdSchema,
  workstreamIdSchema,
} from "./diligence.ts";

const roomId = "8ccbe72e-20fd-4ce8-b021-1f1637a2a5d4";
const workstreamId = "005f3a1a-8f25-4e21-ae36-f849b7338708";
const userId = "651fca86-d5b8-4864-b9e6-686f78f1878a";

const validEvidenceRequest = {
  workstreamId,
  requestedFromUserId: userId,
  title: "Customer references",
  requestText: "Provide three signed customer references.",
  dueAt: "2026-09-18T12:00:00.000Z",
};

const validRisk = {
  workstreamId,
  severity: "critical" as const,
  category: "Governance",
  title: "Missing board approvals",
  description: "No signed board consent was supplied.",
  ownerUserId: userId,
};

test("diligence identifiers accept UUIDs and reject arbitrary strings", () => {
  for (const schema of [
    roomIdSchema,
    riskIdSchema,
    messageIdSchema,
    workstreamIdSchema,
  ]) {
    assert.equal(schema.safeParse(roomId).success, true);
    assert.equal(schema.safeParse("room-123").success, false);
  }
});

test("invite defaults to a 72-hour expiry", () => {
  assert.deepEqual(invitePayloadSchema.parse({}), {
    expiresInHours: 72,
  });
});

test("invite rejects a malformed email when every other field is valid", () => {
  assert.equal(
    invitePayloadSchema.safeParse({
      email: "not-an-email",
      expiresInHours: 72,
    }).success,
    false,
  );
});

test("invite accepts a 320-character email and rejects 321 characters", () => {
  assert.equal(
    invitePayloadSchema.safeParse({
      email: `${"a".repeat(308)}@example.com`,
      expiresInHours: 72,
    }).success,
    true,
  );
  assert.equal(
    invitePayloadSchema.safeParse({
      email: `${"a".repeat(309)}@example.com`,
      expiresInHours: 72,
    }).success,
    false,
  );
});

test("invite expiry must be an integer of at least one hour", () => {
  assert.equal(
    invitePayloadSchema.safeParse({ expiresInHours: 1 }).success,
    true,
  );
  assert.equal(
    invitePayloadSchema.safeParse({ expiresInHours: 0 }).success,
    false,
  );
  assert.equal(
    invitePayloadSchema.safeParse({ expiresInHours: 72.5 }).success,
    false,
  );
});

test("invite expiry accepts 168 hours and rejects 169", () => {
  assert.equal(
    invitePayloadSchema.safeParse({ expiresInHours: 168 }).success,
    true,
  );
  assert.equal(
    invitePayloadSchema.safeParse({ expiresInHours: 169 }).success,
    false,
  );
});

test("evidence request accepts nullable requester and due date", () => {
  assert.equal(
    requestEvidencePayloadSchema.safeParse({
      ...validEvidenceRequest,
      requestedFromUserId: null,
      dueAt: null,
    }).success,
    true,
  );
});

test("evidence request accepts an omitted requester independently", () => {
  assert.equal(
    requestEvidencePayloadSchema.safeParse({
      workstreamId,
      title: "Customer references",
      requestText: "Provide three signed customer references.",
      dueAt: "2026-09-18T12:00:00.000Z",
    }).success,
    true,
  );
});

test("evidence request accepts an omitted due date independently", () => {
  assert.equal(
    requestEvidencePayloadSchema.safeParse({
      workstreamId,
      requestedFromUserId: userId,
      title: "Customer references",
      requestText: "Provide three signed customer references.",
    }).success,
    true,
  );
});

test("evidence request rejects an invalid workstream UUID independently", () => {
  assert.equal(
    requestEvidencePayloadSchema.safeParse({
      ...validEvidenceRequest,
      workstreamId: "invalid",
    }).success,
    false,
  );
});

test("evidence request rejects an invalid requester UUID independently", () => {
  assert.equal(
    requestEvidencePayloadSchema.safeParse({
      ...validEvidenceRequest,
      requestedFromUserId: "invalid",
    }).success,
    false,
  );
});

test("evidence request enforces title minimum and maximum independently", () => {
  assert.equal(
    requestEvidencePayloadSchema.safeParse({
      ...validEvidenceRequest,
      title: "",
    }).success,
    false,
  );
  assert.equal(
    requestEvidencePayloadSchema.safeParse({
      ...validEvidenceRequest,
      title: "T",
    }).success,
    true,
  );
  assert.equal(
    requestEvidencePayloadSchema.safeParse({
      ...validEvidenceRequest,
      title: "T".repeat(160),
    }).success,
    true,
  );
  assert.equal(
    requestEvidencePayloadSchema.safeParse({
      ...validEvidenceRequest,
      title: "T".repeat(161),
    }).success,
    false,
  );
});

test("evidence request enforces request text minimum and maximum independently", () => {
  assert.equal(
    requestEvidencePayloadSchema.safeParse({
      ...validEvidenceRequest,
      requestText: "",
    }).success,
    false,
  );
  assert.equal(
    requestEvidencePayloadSchema.safeParse({
      ...validEvidenceRequest,
      requestText: "R",
    }).success,
    true,
  );
  assert.equal(
    requestEvidencePayloadSchema.safeParse({
      ...validEvidenceRequest,
      requestText: "R".repeat(2000),
    }).success,
    true,
  );
  assert.equal(
    requestEvidencePayloadSchema.safeParse({
      ...validEvidenceRequest,
      requestText: "R".repeat(2001),
    }).success,
    false,
  );
});

test("evidence request rejects a non-ISO due date independently", () => {
  assert.equal(
    requestEvidencePayloadSchema.safeParse({
      ...validEvidenceRequest,
      dueAt: "18 September 2026",
    }).success,
    false,
  );
});

test("risk create rejects an uncontracted severity independently", () => {
  assert.equal(
    riskCreatePayloadSchema.safeParse({
      ...validRisk,
      severity: "low",
    }).success,
    false,
  );
});

test("risk create accepts every contracted severity", () => {
  for (const severity of ["critical", "high", "medium"] as const) {
    assert.equal(
      riskCreatePayloadSchema.safeParse({ ...validRisk, severity }).success,
      true,
    );
  }
});

test("risk create enforces each text minimum independently", () => {
  assert.equal(
    riskCreatePayloadSchema.safeParse({ ...validRisk, category: "" }).success,
    false,
  );
  assert.equal(
    riskCreatePayloadSchema.safeParse({ ...validRisk, category: "C" }).success,
    true,
  );
  assert.equal(
    riskCreatePayloadSchema.safeParse({ ...validRisk, title: "" }).success,
    false,
  );
  assert.equal(
    riskCreatePayloadSchema.safeParse({ ...validRisk, title: "T" }).success,
    true,
  );
  assert.equal(
    riskCreatePayloadSchema.safeParse({ ...validRisk, description: "" })
      .success,
    false,
  );
  assert.equal(
    riskCreatePayloadSchema.safeParse({ ...validRisk, description: "D" })
      .success,
    true,
  );
});

test("risk create enforces each text maximum independently", () => {
  assert.equal(
    riskCreatePayloadSchema.safeParse({
      ...validRisk,
      category: "C".repeat(80),
      title: "T".repeat(180),
      description: "D".repeat(4000),
    }).success,
    true,
  );
  assert.equal(
    riskCreatePayloadSchema.safeParse({
      ...validRisk,
      category: "C".repeat(81),
    }).success,
    false,
  );
  assert.equal(
    riskCreatePayloadSchema.safeParse({
      ...validRisk,
      title: "T".repeat(181),
    }).success,
    false,
  );
  assert.equal(
    riskCreatePayloadSchema.safeParse({
      ...validRisk,
      description: "D".repeat(4001),
    }).success,
    false,
  );
});

test("risk create accepts omitted or nullable optional IDs", () => {
  const { ownerUserId: _ownerUserId, workstreamId: _workstreamId, ...risk } =
    validRisk;

  assert.equal(riskCreatePayloadSchema.safeParse(risk).success, true);
  assert.equal(
    riskCreatePayloadSchema.safeParse({
      ...risk,
      workstreamId: null,
      ownerUserId: null,
    }).success,
    true,
  );
});

test("risk create rejects each invalid optional ID independently", () => {
  assert.equal(
    riskCreatePayloadSchema.safeParse({
      ...validRisk,
      workstreamId: "invalid",
    }).success,
    false,
  );
  assert.equal(
    riskCreatePayloadSchema.safeParse({
      ...validRisk,
      ownerUserId: "invalid",
    }).success,
    false,
  );
});

test("risk patch accepts only the contracted statuses", () => {
  for (const status of [
    "open",
    "under_review",
    "mitigated",
    "accepted",
    "closed",
  ]) {
    assert.equal(riskPatchPayloadSchema.safeParse({ status }).success, true);
  }
  assert.equal(
    riskPatchPayloadSchema.safeParse({ status: "deleted" }).success,
    false,
  );
});

test("risk patch owner is optional, nullable, or a UUID", () => {
  assert.equal(
    riskPatchPayloadSchema.safeParse({ status: "open" }).success,
    true,
  );
  assert.equal(
    riskPatchPayloadSchema.safeParse({ status: "open", ownerUserId: null })
      .success,
    true,
  );
  assert.equal(
    riskPatchPayloadSchema.safeParse({ status: "open", ownerUserId: userId })
      .success,
    true,
  );
  assert.equal(
    riskPatchPayloadSchema.safeParse({
      status: "open",
      ownerUserId: "invalid",
    }).success,
    false,
  );
});

test("discussion preserves supplied whitespace and enforces length boundaries", () => {
  assert.deepEqual(discussionPayloadSchema.parse({ body: "  Review note.  " }), {
    body: "  Review note.  ",
  });
  assert.equal(
    discussionPayloadSchema.safeParse({ body: "" }).success,
    false,
  );
  assert.equal(
    discussionPayloadSchema.safeParse({ body: "N" }).success,
    true,
  );
  assert.equal(
    discussionPayloadSchema.safeParse({ body: "N".repeat(5000) }).success,
    true,
  );
  assert.equal(
    discussionPayloadSchema.safeParse({ body: "N".repeat(5001) }).success,
    false,
  );
});

test("recommendation rejects an invalid decision independently", () => {
  assert.equal(
    recommendationPayloadSchema.safeParse({
      decision: "approve",
      rationale: "Proceed after the remaining evidence is supplied.",
    }).success,
    false,
  );
});

test("recommendation accepts every contracted decision", () => {
  for (const decision of [
    "proceed",
    "proceed_with_conditions",
    "pause_diligence",
    "decline",
  ] as const) {
    assert.equal(
      recommendationPayloadSchema.safeParse({
        decision,
        rationale: "Proceed after the remaining evidence is supplied.",
      }).success,
      true,
    );
  }
});

test("recommendation enforces rationale minimum and maximum independently", () => {
  assert.equal(
    recommendationPayloadSchema.safeParse({
      decision: "proceed",
      rationale: "",
    }).success,
    false,
  );
  assert.equal(
    recommendationPayloadSchema.safeParse({
      decision: "proceed",
      rationale: "R",
    }).success,
    true,
  );
  assert.equal(
    recommendationPayloadSchema.safeParse({
      decision: "proceed",
      rationale: "R".repeat(5000),
    }).success,
    true,
  );
  assert.equal(
    recommendationPayloadSchema.safeParse({
      decision: "proceed",
      rationale: "R".repeat(5001),
    }).success,
    false,
  );
});

test("recommendation accepts null conditions and enforces their maximum", () => {
  assert.equal(
    recommendationPayloadSchema.safeParse({
      decision: "proceed_with_conditions",
      rationale: "Proceed after the remaining evidence is supplied.",
      conditions: null,
    }).success,
    true,
  );
  assert.equal(
    recommendationPayloadSchema.safeParse({
      decision: "proceed_with_conditions",
      rationale: "Proceed after the remaining evidence is supplied.",
      conditions: "C".repeat(5000),
    }).success,
    true,
  );
  assert.equal(
    recommendationPayloadSchema.safeParse({
      decision: "proceed_with_conditions",
      rationale: "Proceed after the remaining evidence is supplied.",
      conditions: "C".repeat(5001),
    }).success,
    false,
  );
});

test("invite token accepts base64url strings at lengths 40 and 64", () => {
  assert.equal(inviteTokenSchema.safeParse("a".repeat(40)).success, true);
  assert.equal(inviteTokenSchema.safeParse("A1_-".repeat(16)).success, true);
});

test("invite token rejects lengths 39 and 65 independently", () => {
  assert.equal(inviteTokenSchema.safeParse("a".repeat(39)).success, false);
  assert.equal(inviteTokenSchema.safeParse("a".repeat(65)).success, false);
});

test("invite token rejects a non-base64url character independently", () => {
  assert.equal(
    inviteTokenSchema.safeParse(`${"a".repeat(39)}+`).success,
    false,
  );
});
