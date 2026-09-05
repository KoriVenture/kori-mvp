import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

function source(relative: string) {
  const path = resolve(process.cwd(), relative);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

test("JoinNetworkForm preserves validation, status, and focus behavior", () => {
  const form = source("src/components/join/JoinNetworkForm.tsx");

  for (const text of [
    "This field is required.",
    "Enter your email address.",
    "Enter a valid email address.",
    "Select the role closest to yours.",
    "Enter a complete URL beginning with https://",
    "Consent is required before submitting.",
    "Review the highlighted fields before continuing.",
    "Sending your information securely…",
    "Thank you for joining the Kori network.",
    "Your information was submitted successfully. We’ll be in touch when there is a relevant next step.",
    "We could not submit your information.",
    "Please try again shortly. If the problem continues, contact Kori directly.",
    "Submit interest →",
    "Submitting…",
  ]) {
    assert.ok(form.includes(text), `JoinNetworkForm must contain ${text}`);
  }

  for (const behavior of [
    ".validity.valid",
    "onBlur",
    "aria-invalid",
    "interest-count",
    "window.location.hash",
    "form-status",
    ".focus()",
  ]) {
    assert.ok(form.includes(behavior), `JoinNetworkForm must contain ${behavior}`);
  }
});

test("join submission keeps the exact snake_case payload and server table", () => {
  const form = source("src/components/join/JoinNetworkForm.tsx");
  const route = source("src/app/api/waiting-list/route.ts");
  const combined = `${form}\n${route}`;

  for (const name of [
    "first_name",
    "last_name",
    "email",
    "role",
    "country",
    "linkedin",
    "interest",
    "consent",
    "waiting_list_form",
  ]) {
    assert.ok(combined.includes(name), `join runtime must contain ${name}`);
  }

  assert.match(form, /fetch\(\s*["']\/api\/waiting-list["']/);
  for (const forbidden of [
    ["plnpgjjrc", "vehdsigsgiv"].join(""),
    ["sb_publishable_", "akKi4NOz"].join(""),
  ]) {
    assert.equal(combined.includes(forbidden), false);
  }
});
