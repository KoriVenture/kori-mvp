import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, resolve } from "node:path";
import test from "node:test";

function source(relative: string) {
  return readFileSync(resolve(process.cwd(), relative), "utf8");
}

function forbiddenPublicFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) return forbiddenPublicFiles(absolute);
    return [".js", ".mjs", ".cjs", ".html", ".css"].includes(extname(entry.name))
      ? [absolute]
      : [];
  });
}

test("public contains passive assets only", () => {
  assert.equal(existsSync(resolve(process.cwd(), "public", "kori.js")), false);
  assert.equal(existsSync(resolve(process.cwd(), "public", "join-form.js")), false);
  assert.deepEqual(forbiddenPublicFiles(resolve(process.cwd(), "public")), []);
});

test("site effects are React-managed", () => {
  const frame = source("src/components/SiteFrame.tsx");
  const effects = source("src/components/site/SiteEffects.tsx");
  assert.doesNotMatch(frame, /next\/script/);
  assert.doesNotMatch(frame, /\/kori\.js/);
  assert.match(frame, /<SiteEffects\s*\/>/);
  assert.match(effects, /"use client"/);
  assert.match(effects, /useEffect/);
  assert.match(effects, /IntersectionObserver/);
  assert.match(effects, /requestAnimationFrame/);
});

test("join form is React and server routed", () => {
  const page = source("src/app/join/page.tsx");
  const form = source("src/components/join/JoinNetworkForm.tsx");
  const route = source("src/app/api/waiting-list/route.ts");
  assert.doesNotMatch(page, /next\/script/);
  assert.doesNotMatch(page, /join-form\.js/);
  assert.match(page, /<JoinNetworkForm\s*\/>/);
  assert.match(form, /fetch\(\s*["']\/api\/waiting-list["']/);
  assert.match(route, /\.from\(["']waiting_list_form["']\)/);
  for (const forbidden of [
    ["plnpgjjrc", "vehdsigsgiv"].join(""),
    ["sb_publishable_", "akKi4NOz"].join(""),
  ]) {
    assert.equal(route.includes(forbidden), false);
  }
});

test("responsive CSS uses min-width breakpoints", () => {
  const css = source("src/app/globals.css");
  assert.doesNotMatch(css, /@media\s*\(\s*max-width\s*:/);
  for (const breakpoint of ["601px", "821px", "901px", "1101px", "1280px"]) {
    assert.match(css, new RegExp(`@media\\s*\\(min-width:\\s*${breakpoint}\\)`));
  }
});

test("onboarding progress is proportional", () => {
  const progress = source("src/components/onboarding/shared/OnboardingProgress.tsx");
  assert.match(progress, /progress:\s*number/);
  assert.match(progress, /width:\s*`\$\{value\}%`/);
  assert.doesNotMatch(progress, /width:\s*number/);
  assert.doesNotMatch(progress, /\$\{width\}px/);
});

test("Stellar funding responsive rules are mobile-first", () => {
  const css = source("src/app/globals.css");
  const panel = source("src/components/stellar/DealFundingPanel.tsx");
  assert.match(panel, /className="stellar-funding-grid"/);
  assert.match(css, /\.stellar-funding-grid\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
  assert.match(css, /@media\s*\(min-width:\s*901px\)[\s\S]*?\.stellar-funding-grid\s*\{[\s\S]*?minmax\(220px/);
});

test("dashboard expands for live funding content", () => {
  const css = source("src/app/globals.css");
  const dashboard = source("src/components/dashboard/InvestorDashboardView.tsx");
  assert.match(dashboard, /<DealFundingPanel\s*\/>/);
  assert.match(css, /@media\s*\(min-width:\s*1101px\)[\s\S]*?\.investor-dashboard\s*\{[\s\S]*?height:\s*auto;[\s\S]*?min-height:\s*680px/);
  assert.match(css, /@media\s*\(min-width:\s*1101px\)[\s\S]*?\.dashboard-main\s*\{[\s\S]*?overflow:\s*visible/);
});

test("founder flow does not render legacy layout classes", () => {
  const combined = [
    "src/components/onboarding/founder/FounderOnboarding.tsx",
    "src/components/onboarding/shared/Shell.tsx",
    "src/components/onboarding/shared/Editorial.tsx",
    "src/components/onboarding/shared/Completion.tsx",
  ].map(source).join("\n");

  for (const legacy of [
    "account-page",
    "editorial-panel",
    "form-panel",
    "account-form",
    "form-section",
    "two-columns",
    "primary-button",
    "secondary-button",
    "completion-button",
    "network-visual",
  ]) {
    assert.doesNotMatch(combined, new RegExp(`className=["'][^"']*\\b${legacy}\\b`));
  }
});
