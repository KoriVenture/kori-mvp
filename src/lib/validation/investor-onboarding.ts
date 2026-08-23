import { z } from "zod";
import { agreementsSchema, profileSchema } from "../onboarding/contracts.ts";

export const investorPreferencesSchema = z.object({
  investorType: z.enum(["individual", "fund_manager"]).default("individual"),
  expertiseAreas: z.array(z.string()).default([]), askMeAbout: z.string().max(2000).default(""),
  preferredRegions: z.array(z.string()).default([]), investmentStages: z.array(z.string()).default([]),
  preferredTicketSize: z.string().max(120).default(""), preferredInstruments: z.array(z.string()).default([]),
  investmentHorizon: z.string().max(120).default(""), investmentThesis: z.string().max(4000).default(""),
});
export const investorEligibilitySchema = z.object({
  investorClassification: z.string().min(1), investmentExperience: z.string().min(1),
  privateCompanyExperience: z.string().min(1), sourceOfFunds: z.string().min(1),
  riskDisclosure: z.literal(true), riskAcknowledged: z.literal(true),
});
export const investorPatchSchema = z.object({
  screen: z.number().int().min(0).max(7), profile: profileSchema.optional(),
  preferences: investorPreferencesSchema.optional(), eligibility: investorEligibilitySchema.optional(),
  agreements: agreementsSchema.optional(), complete: z.boolean().optional(),
});
export type InvestorPatch = z.infer<typeof investorPatchSchema>;
