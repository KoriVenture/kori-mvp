import assert from "node:assert/strict";
import test from "node:test";

import {
  emailSignupUrl,
  googleLoginUrl,
  linkedinLoginUrl,
  organizationLoginUrl,
  securityReauthUrl,
} from "./auth-links.ts";

test("email signup sends Auth0 the role return path and login hint", () => {
  process.env.NEXT_PUBLIC_AUTH0_DATABASE_CONNECTION = "Kori-Users";

  assert.equal(
    emailSignupUrl("investor", "investor@example.com"),
    "/auth/login?returnTo=%2Fonboarding%2Finvestor%3Fauth%3Dcomplete&connection=Kori-Users&login_hint=investor%40example.com&screen_hint=signup",
  );
});

test("social, reauthentication, and organization links remain role-scoped", () => {
  process.env.NEXT_PUBLIC_AUTH0_GOOGLE_CONNECTION = "google-kori";
  process.env.NEXT_PUBLIC_AUTH0_LINKEDIN_CONNECTION = "linkedin-kori";

  assert.equal(
    googleLoginUrl("founder"),
    "/auth/login?returnTo=%2Fonboarding%2Ffounder%3Fauth%3Dcomplete&connection=google-kori",
  );
  assert.equal(
    linkedinLoginUrl("investor"),
    "/auth/login?returnTo=%2Fonboarding%2Finvestor%3Fauth%3Dcomplete&connection=linkedin-kori",
  );
  assert.equal(
    securityReauthUrl("founder"),
    "/auth/login?returnTo=%2Fonboarding%2Ffounder%3Fauth%3Dcomplete&prompt=login",
  );
  assert.equal(
    organizationLoginUrl("investor", "org_123"),
    "/auth/login?returnTo=%2Fonboarding%2Finvestor%3Fauth%3Dcomplete&organization=org_123",
  );
});
