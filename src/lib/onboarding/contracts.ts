import { z } from "zod";

export const PUBLIC_SIGNUP_ROLES = ["investor", "founder"] as const;
export type PublicSignupRole = (typeof PUBLIC_SIGNUP_ROLES)[number];

export function publicSignupRole(value: unknown): PublicSignupRole | null {
  return value === "investor" || value === "founder" ? value : null;
}

const SAFE_REDIRECTS = new Set([
  "/onboarding/investor",
  "/onboarding/founder",
  "/profile",
  "/dashboard",
]);

export function safeRedirectPath(value: string | null | undefined) {
  return value && SAFE_REDIRECTS.has(value) ? value : "/profile";
}

export function forceDeferredVerification(): "deferred" {
  return "deferred";
}

export const documentTypes = [
  "pitch_deck",
  "company_overview",
  "supporting_document",
] as const;

export const documentMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
] as const;

export const documentUploadSchema = z.object({
  documentType: z.enum(documentTypes),
  title: z.string().trim().min(1).max(160),
  size: z.number().int().positive().max(10 * 1024 * 1024),
  mimeType: z.enum(documentMimeTypes),
});

export const profileSchema = z.object({
  legalFirstName: z.string().trim().max(120).default(""),
  legalLastName: z.string().trim().max(120).default(""),
  country: z.string().trim().max(120).default(""),
  city: z.string().trim().max(120).default(""),
  timezone: z.string().trim().max(80).default(""),
  linkedinUrl: z.union([z.literal(""), z.url()]).default(""),
  professionalTitle: z.string().trim().max(160).default(""),
  organization: z.string().trim().max(160).default(""),
  biography: z.string().trim().max(3000).default(""),
  photoPath: z.string().trim().max(500).default(""),
  languages: z.array(z.string().trim().min(1)).max(20).default([]),
});

export const agreementsSchema = z.object({
  terms: z.literal(true),
  privacy: z.literal(true),
  platform: z.literal(true),
  risk: z.literal(true),
  signatureName: z.string().trim().min(2).max(200),
  signedAt: z.iso.datetime(),
});

export const bootstrapSchema = z.object({
  role: z.enum(PUBLIC_SIGNUP_ROLES),
  country: z.string().trim().max(120).default(""),
  termsAccepted: z.boolean().default(false),
  newsletter: z.boolean().default(false),
});
