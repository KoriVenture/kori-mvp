import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

function source(relative: string) {
  return readFileSync(resolve(process.cwd(), relative), "utf8");
}

test("founder onboarding uses the shared Kori shell and no legacy layout", () => {
  const founder = source(
    "src/components/onboarding/founder/FounderOnboarding.tsx",
  );
  const shell = source("src/components/onboarding/shared/Shell.tsx");

  assert.match(founder, /<Shell/);
  assert.match(founder, /founder/);
  assert.match(shell, /"founder-basic"/);
  assert.match(shell, /"founder-profile"/);
  assert.match(shell, /"founder-review"/);
  assert.match(shell, /<EditorialPanel/);
  assert.match(shell, /className="ko-page ko-screen--founder"/);
  assert.doesNotMatch(founder, /founder-(?:shell|main|panel|form)/);
});

test("login is a real shared entry point for returning users", () => {
  const route = source("src/app/login/page.tsx");
  const screen = source("src/components/auth/LoginScreen.tsx");
  const form = source("src/components/onboarding/shared/SignInForm.tsx");

  assert.match(route, /supabase\.auth\.getUser\(\)/);
  assert.match(route, /redirect\("\/dashboard"\)/);
  assert.match(screen, /<SignInForm/);
  assert.match(form, /signInEmailPassword/);
  assert.match(form, /startSocialSignIn\(provider, redirectTo\)/);
  assert.match(form, /social\("google"\)/);
  assert.match(form, /social\("linkedin_oidc"\)/);
});
