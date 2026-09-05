import { z } from "zod";

export const diligenceAiRequestSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  audience: z.enum(["investor", "founder"]).optional(),
  mode: z.enum([
    "general",
    "explain_question",
    "draft_response",
    "suggest_evidence",
    "explain_clarification",
    "readiness",
    "explain_term",
    "analyze_terms",
  ]).optional(),
  requestId: z.uuid().optional(),
  termKey: z.string().trim().max(100).optional(),
}).strict();

export type FounderAiMode = NonNullable<z.infer<typeof diligenceAiRequestSchema>["mode"]>;
