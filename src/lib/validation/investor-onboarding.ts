import { z } from "zod";
import {
  agreementsSchema,
  profileSchema,
} from "../onboarding/contracts";

export const investorPreferencesSchema =
  z.object({
    investorType: z
      .enum(["individual", "fund_manager"])
      .default("individual"),
    expertiseAreas: z
      .array(z.string().trim().min(1))
      .max(30)
      .default([]),
    askMeAbout: z
      .string()
      .trim()
      .max(2000)
      .default(""),
    preferredRegions: z
      .array(z.string().trim().min(1))
      .max(30)
      .default([]),
    investmentStages: z
      .array(z.string().trim().min(1))
      .max(20)
      .default([]),
    preferredTicketSizes: z
      .array(z.string().trim().min(1))
      .max(10)
      .default([]),
    preferredInstruments: z
      .array(z.string().trim().min(1))
      .max(20)
      .default([]),
    investmentHorizon: z
      .string()
      .trim()
      .max(120)
      .default(""),
    investmentThesis: z
      .string()
      .trim()
      .max(4000)
      .default(""),
  });

export const investorEligibilityDraftSchema =
  z.object({
    investorClassification: z
      .string()
      .trim()
      .max(160)
      .default(""),
    investmentExperience: z
      .string()
      .trim()
      .max(160)
      .default(""),
    privateCompanyExperience: z
      .enum(["Yes", "No", "Some", ""])
      .default(""),
    sourceOfFunds: z
      .string()
      .trim()
      .max(200)
      .default(""),
    riskAcknowledged: z
      .boolean()
      .default(false),
  });

export const investorEligibilitySchema =
  z.object({
    investorClassification: z
      .string()
      .trim()
      .min(1)
      .max(160),
    investmentExperience: z
      .string()
      .trim()
      .min(1)
      .max(160),
    privateCompanyExperience: z.enum([
      "Yes",
      "No",
      "Some",
    ]),
    sourceOfFunds: z
      .string()
      .trim()
      .min(1)
      .max(200),
    riskAcknowledged: z.literal(true),
  });

export const investorPatchSchema = z.object({
  screen: z.number().int().min(0).max(6),
  profile: profileSchema.optional(),
  preferences:
    investorPreferencesSchema.optional(),
  eligibility:
    investorEligibilityDraftSchema.optional(),
  agreements: agreementsSchema.optional(),
  complete: z.boolean().optional(),
});

export type InvestorPatch = z.infer<
  typeof investorPatchSchema
>;
