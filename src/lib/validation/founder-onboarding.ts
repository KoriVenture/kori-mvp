import { z } from "zod";

import {
  agreementsSchema,
  profileSchema,
} from "../onboarding/contracts.ts";

export const startupSchema = z.object({
  id: z.uuid().optional(),
  legalName: z.string().trim().min(1).max(240),
  displayName: z.string().trim().max(240).default(""),
  country: z.string().trim().min(1).max(120),
  sector: z.string().trim().min(1).max(160),
  website: z.union([z.literal(""), z.url()]).default(""),
  description: z.string().trim().max(3000).default(""),
  foundingYear: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getUTCFullYear())
    .optional(),
  stage: z.string().trim().max(120).default(""),
});

export const founderPatchSchema = z.object({
  screen: z.number().int().min(0).max(6),
  profile: profileSchema.optional(),
  startup: startupSchema.optional(),
  agreements: agreementsSchema.omit({ risk: true }).optional(),
  complete: z.boolean().optional(),
});

export type FounderPatch = z.infer<typeof founderPatchSchema>;
