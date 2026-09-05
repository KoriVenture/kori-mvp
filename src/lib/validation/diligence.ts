import { z } from "zod";

export const roomIdSchema = z.uuid();
export const riskIdSchema = z.uuid();
export const messageIdSchema = z.uuid();
export const workstreamIdSchema = z.uuid();

export const invitePayloadSchema = z.object({
  email: z.string().email().max(320).optional(),
  expiresInHours: z.number().int().min(1).max(168).default(72),
});

export const requestEvidencePayloadSchema = z.object({
  workstreamId: workstreamIdSchema,
  requestedFromUserId: z.uuid().nullable().optional(),
  title: z.string().min(1).max(160),
  requestText: z.string().min(1).max(2000),
  dueAt: z.iso.datetime().nullable().optional(),
});

export const riskCreatePayloadSchema = z.object({
  workstreamId: workstreamIdSchema.nullable().optional(),
  severity: z.enum(["critical", "high", "medium"]),
  category: z.string().min(1).max(80),
  title: z.string().min(1).max(180),
  description: z.string().min(1).max(4000),
  ownerUserId: z.uuid().nullable().optional(),
});

export const riskPatchPayloadSchema = z.object({
  status: z.enum(["open", "under_review", "mitigated", "accepted", "closed"]),
  ownerUserId: z.uuid().nullable().optional(),
});

export const discussionPayloadSchema = z.object({
  body: z.string().min(1).max(5000),
});

export const recommendationPayloadSchema = z.object({
  decision: z.enum([
    "proceed",
    "proceed_with_conditions",
    "pause_diligence",
    "decline",
  ]),
  rationale: z.string().min(1).max(5000),
  conditions: z.string().max(5000).nullable().optional(),
});

export const inviteTokenSchema = z.base64url().min(40).max(64);

export type InvitePayload = z.infer<typeof invitePayloadSchema>;
export type RequestEvidencePayload = z.infer<typeof requestEvidencePayloadSchema>;
export type RiskCreatePayload = z.infer<typeof riskCreatePayloadSchema>;
export type RiskPatchPayload = z.infer<typeof riskPatchPayloadSchema>;
export type DiscussionPayload = z.infer<typeof discussionPayloadSchema>;
export type RecommendationPayload = z.infer<typeof recommendationPayloadSchema>;
