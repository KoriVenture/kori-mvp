import { z } from "zod";

export const founderDiligenceResponseSchema = z.object({ body: z.string().trim().min(1).max(8000) });
export const founderDiligenceEvidenceSchema = z.object({ startupDocumentId: z.uuid(), claim: z.string().trim().max(4000).nullable().optional() });
