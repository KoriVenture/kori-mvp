import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

function repositorySource(relative: string) {
  const path = resolve(process.cwd(), relative);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

test("the investor dashboard route renders the authenticated Figma shell", () => {
  const route = repositorySource("src/app/dashboard/page.tsx");
  const view = repositorySource(
    "src/components/dashboard/InvestorDashboardView.tsx",
  );

  assert.match(route, /supabase\.auth\.getUser\(\)/);
  assert.match(route, /roles\.includes\("investor"\)/);
  assert.match(route, /onboarding_status !== "completed"/);
  assert.match(route, /<InvestorDashboardView/);

  assert.match(view, /className="investor-dashboard"/);
  assert.match(view, />Diligence</);
  assert.match(view, /className="dashboard-detail-grid"/);
  assert.match(view, /Evidence Log/i);
  assert.match(view, /SPV Progress/i);
  assert.match(view, /profilePhotoUrl\(profile\.photo_path\)/);
});

test("the live profile renders investor preferences with neutral MVP claims", () => {
  const route = repositorySource("src/app/profile/page.tsx");
  const view = repositorySource(
    "src/components/onboarding/profile/ProfileView.tsx",
  );

  assert.match(route, /\.from\("investor_profiles"\)[\s\S]*?\.select\("\*"\)/);
  assert.match(route, /investor=\{investor\.data\}/);

  assert.match(view, /investor\?: InvestorProfile \| null/);
  assert.match(view, /Investment Thesis & Expertise/);
  assert.match(view, /Identity Deferred/);
  assert.match(view, /KYC Deferred/);
  assert.match(view, /Funding Not connected/);
  assert.doesNotMatch(view, /KYC Completed|Identity Verified|Wallet Connected/);
});

test("profile and dashboard desktop geometry keeps the extracted numeric contract", () => {
  const css = repositorySource("src/app/globals.css");

  assert.match(
    css,
    /BEGIN KORI FIGMA PROFILE \+ INVESTOR DASHBOARD FIX/,
  );
  assert.match(
    css,
    /\.profile-page\{[\s\S]*?grid-template-columns:220px 1fr;/,
  );
  assert.match(css, /\.profile-cover\{[\s\S]*?height:230px;/);
  assert.match(
    css,
    /\.profile-identity>img\{[\s\S]*?width:128px;[\s\S]*?height:128px;/,
  );
  assert.match(
    css,
    /\.profile-grid\{[\s\S]*?grid-template-columns:minmax\(0,1\.7fr\) minmax\(280px,1fr\);[\s\S]*?gap:24px;/,
  );
  assert.match(css, /\.investor-dashboard\{[\s\S]*?height:680px;/);
  assert.match(css, /\.dashboard-sidebar\{[\s\S]*?width:240px;/);
  assert.match(css, /\.dashboard-main\{[\s\S]*?padding:32px;/);
  assert.match(css, /\.dashboard-progress-track\{[\s\S]*?height:6px;/);
});
