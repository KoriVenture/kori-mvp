import assert from "node:assert/strict";
import test from "node:test";
import {
  bootstrapSchema,
  documentUploadSchema,
  forceDeferredVerification,
  publicSignupRole,
  safeRedirectPath,
} from "./contracts.ts";

test("public signup never accepts admin", () => {
  assert.equal(publicSignupRole("founder"), "founder");
  assert.equal(publicSignupRole("investor"), "investor");
  assert.equal(publicSignupRole("admin"), null);
});

test("callback redirects are allowlisted", () => {
  assert.equal(safeRedirectPath("/onboarding/founder"), "/onboarding/founder");
  assert.equal(safeRedirectPath("https://evil.example"), "/profile");
});

test("KYC status is always deferred", () => {
  assert.equal(forceDeferredVerification(), "deferred");
});

test("social bootstrap permits missing first-screen agreement acceptance", () => {
  const explicitDecline = bootstrapSchema.safeParse({
    role: "investor",
    termsAccepted: false,
  });
  const omitted = bootstrapSchema.safeParse({ role: "founder" });

  assert.equal(explicitDecline.success, true);
  assert.equal(omitted.success, true);
  if (omitted.success) {
    assert.equal(omitted.data.termsAccepted, false);
  }
});

test("documents enforce category, MIME, and 10 MB limit", () => {
  const base = { documentType: "pitch_deck", title: "Deck", size: 1024, mimeType: "application/pdf" };
  assert.equal(documentUploadSchema.safeParse(base).success, true);
  assert.equal(documentUploadSchema.safeParse({ ...base, documentType: "kyc" }).success, false);
  assert.equal(documentUploadSchema.safeParse({ ...base, mimeType: "application/zip" }).success, false);
  assert.equal(documentUploadSchema.safeParse({ ...base, size: 10 * 1024 * 1024 + 1 }).success, false);
});
