import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

function source(relative: string) {
  return readFileSync(
    fileURLToPath(
      new URL(relative, import.meta.url),
    ),
    "utf8",
  );
}

test("Step 2 security choices are not permanently blocked", () => {
  const secure = source(
    "./steps/VerifySecureStep.tsx",
  );

  assert.doesNotMatch(
    secure,
    /if\s*\(\s*value\s*===\s*"totp"\s*\|\|\s*value\s*===\s*"sms"\s*\)\s*return/,
  );

  assert.match(
    secure,
    /selected=\{draft\.securityMethod === "totp"\}/,
  );

  assert.match(
    secure,
    /selected=\{draft\.securityMethod === "sms"\}/,
  );

  assert.doesNotMatch(
    secure,
    /title="Authenticator App"[\s\S]{0,300}\bdisabled\b/,
  );

  assert.doesNotMatch(
    secure,
    /title="SMS Backup"[\s\S]{0,300}\bdisabled\b/,
  );
});

test("Step 1 role change is an actual action", () => {
  const create = source(
    "./steps/CreateAccountStep.tsx",
  );

  assert.match(
    create,
    /onClick=\{onChangeRole\}/,
  );
});

test("Step 1 legal documents are actual links", () => {
  const create = source(
    "./steps/CreateAccountStep.tsx",
  );

  assert.match(create, /href="\/terms"/);
  assert.match(create, /href="\/privacy"/);
});

test("onboarding overlays inherit the onboarding control reset and trap keyboard focus", () => {
  for (const relative of [
    "../shared/SignInDialog.tsx",
    "./steps/SecurityEnrollmentDialog.tsx",
  ]) {
    const dialog = source(relative);
    assert.match(dialog, /kori-onboarding ko-dialog-backdrop/);
    assert.match(dialog, /onKeyDown=/);
    assert.match(dialog, /event\.key === "Escape"/);
    assert.match(dialog, /event\.key !== "Tab"/);
    assert.doesNotMatch(dialog, /if \(!controls\.length\) return/);
  }
});

test("photo actions share an immediate concurrency guard", () => {
  const onboarding = source("./InvestorOnboarding.tsx");

  assert.match(onboarding, /photoActionInProgress/);
  assert.match(onboarding, /async function removePhoto\(\)[\s\S]*setBusy\(true\)/);
  assert.match(onboarding, /Photo removal failed\./);
});

test("MFA progress-save errors are rethrown to the visible dialog", () => {
  const onboarding = source("./InvestorOnboarding.tsx");

  assert.match(
    onboarding,
    /Unable to finish security setup\.[\s\S]{0,180}throw/,
  );
});

test("final completion does not resend eligibility and surfaces development database errors", () => {
  const onboarding = source("./InvestorOnboarding.tsx");
  const completeFunction = onboarding.match(
    /async function complete\(\) \{[\s\S]*?\n  \}\n\n  function saveExit/,
  )?.[0];

  assert.ok(completeFunction);
  assert.doesNotMatch(completeFunction, /eligibility\s*:/);
  assert.match(onboarding, /body\?\.database\?\.message/);
});
