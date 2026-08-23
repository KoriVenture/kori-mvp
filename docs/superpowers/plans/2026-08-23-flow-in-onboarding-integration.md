# Flow-in MVP Onboarding Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add source-faithful, resumable Investor and Founder onboarding with Supabase-backed authentication, persistence, private document storage, completion, and role-aware profiles to the current root-level Kori App Router site.

**Architecture:** Client onboarding controllers render shared source-faithful primitives and send section-specific payloads to authenticated App Router handlers. Server helpers own Supabase sessions, validation, role enforcement, persistence, callback redirects, and document checks; SQL migrations enforce the same ownership model with triggers, RLS, and private buckets.

**Tech Stack:** Next.js 16.3.2, React 19.2.8, TypeScript 5.9, Supabase JS/SSR, Zod, Node test runner, existing global CSS and plain image assets.

**Spec:** `docs/superpowers/specs/2026-08-22-flow-in-onboarding-integration-design.md`

## Global Constraints

- Preserve the current root-level Next.js application and the existing monorepo deletions.
- Preserve the attachment's investor DOM hierarchy, plain `<img>` rendering, CSS values, copy, spacing, proportions, and responsive behavior.
- Reuse the investor visual primitives for Founder onboarding; do not add a UI or animation library.
- Public signup permits only `investor` and `founder`; `admin` remains trusted-backend-only.
- KYC is visible but disabled and non-blocking; persistence always forces `verification_status=deferred`.
- Do not add community, deal, diligence, wallet, milestone, multisig, or capital-release functionality.
- Missing Supabase configuration must not prevent pages or builds from rendering.

---

### Task 1: Dependencies, test harness, environment, and pure contracts

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `.env.example`
- Create: `src/lib/onboarding/contracts.ts`
- Create: `src/lib/validation/investor-onboarding.ts`
- Create: `src/lib/validation/founder-onboarding.ts`
- Create: `src/lib/onboarding/contracts.test.ts`

**Interfaces:**
- Produces `publicSignupRole`, `safeRedirectPath`, `documentUploadSchema`, `investorPatchSchema`, and `founderPatchSchema` for routes and controllers.

- [ ] Write Node tests proving Admin is rejected, callback redirects are allowlisted, KYC is forced deferred, and document type/MIME/size rules reject invalid input.
- [ ] Run `npm test` and confirm the new tests fail because the contract modules do not exist.
- [ ] Install only `@supabase/supabase-js`, `@supabase/ssr`, and `zod`; add `test`, `typecheck`, and existing scripts without a package-local lockfile.
- [ ] Implement the minimal typed Zod contracts and environment example needed for the tests.
- [ ] Run `npm test` and confirm all contract tests pass.

### Task 2: Supabase session infrastructure and callback

**Files:**
- Create: `src/lib/supabase/config.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/proxy.ts`
- Create: `proxy.ts`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/app/auth/callback/route.test.ts`

**Interfaces:**
- Produces optional browser/server clients that report missing configuration safely, cookie session refresh, authenticated-user lookup, and allowlisted code-exchange redirects.

- [ ] Write callback and missing-configuration tests that assert safe redirects and a non-secret `503` failure.
- [ ] Run the targeted tests and confirm they fail because the session infrastructure is absent.
- [ ] Implement configuration guards, browser/server client factories, proxy refresh, and callback exchange.
- [ ] Run the targeted tests and then `npm test` until green.

### Task 3: Database trigger, RLS, and private storage

**Files:**
- Create: `supabase/migrations/001_onboarding.sql`
- Create: `supabase/migrations/002_onboarding_rls.sql`
- Create: `supabase/migrations/003_onboarding_storage.sql`
- Create: `src/lib/onboarding/migrations.test.ts`

**Interfaces:**
- Produces the exact enums/tables from the attachment, a trigger that maps only Founder/Investor metadata, authenticated ownership policies, and `profile-photos` plus `startup-data-room` buckets.

- [ ] Write structural tests that inspect the SQL for every required table, trigger guard, RLS enablement/policy, private bucket, and user-scoped storage predicate.
- [ ] Run the migration tests and confirm failure while files are absent.
- [ ] Add the three idempotent migrations from Sections 11–14, including no public Admin path and no service-role policy.
- [ ] Run migration tests and the full test suite until green.

### Task 4: Authenticated Investor and Founder APIs

**Files:**
- Create: `src/lib/onboarding/repository.ts`
- Create: `src/lib/onboarding/http.ts`
- Create: `src/app/api/onboarding/investor/route.ts`
- Create: `src/app/api/onboarding/founder/route.ts`
- Create: `src/app/api/onboarding/founder/documents/route.ts`
- Create: `src/lib/onboarding/api.test.ts`

**Interfaces:**
- Produces authenticated `GET`/`PATCH` endpoints for each role and a Founder-only multipart upload endpoint. All IDs come from the session; all errors map to `400/401/403/404/500/503` without logging personal payloads.

- [ ] Write repository-independent tests for status mapping, role checks, progress/completion transitions, owned startup selection, upload path construction, and cleanup-after-metadata-failure.
- [ ] Run targeted tests and confirm expected failures.
- [ ] Implement narrow repository operations and route handlers using the Task 1 schemas and Task 2 server client.
- [ ] Run targeted and full tests until green.

### Task 5: Source-faithful shared onboarding UI and assets

**Files:**
- Modify: `src/app/globals.css`
- Create: `public/assets/onboarding/shared/*`
- Create: `public/assets/onboarding/investor/*`
- Create: `src/components/onboarding/shared/Editorial.tsx`
- Create: `src/components/onboarding/shared/Shell.tsx`
- Create: `src/components/onboarding/shared/Field.tsx`
- Create: `src/components/onboarding/shared/SelectField.tsx`
- Create: `src/components/onboarding/shared/Chips.tsx`
- Create: `src/components/onboarding/shared/Choice.tsx`
- Create: `src/components/onboarding/shared/Completion.tsx`
- Create: `src/components/onboarding/shared/source-fidelity.test.ts`

**Interfaces:**
- Produces `.kori-onboarding`-scoped primitives that retain Appendix A markup/class names and Appendix B values without affecting public pages.

- [ ] Write static fidelity tests for required source classes, plain image paths, disabled KYC button styling, CSS namespace, breakpoints, and absence of UI/animation dependencies.
- [ ] Run fidelity tests and confirm failure.
- [ ] Copy the exact listed assets into the prescribed folders and implement the shared primitives.
- [ ] Append the Appendix B rules under `.kori-onboarding`, retaining declaration values and media queries while omitting duplicate imports.
- [ ] Run fidelity and full tests until green.

### Task 6: Investor onboarding and profile presentation

**Files:**
- Create: `src/components/onboarding/investor/investor-onboarding.types.ts`
- Create: `src/components/onboarding/investor/InvestorOnboarding.tsx`
- Create: `src/app/onboarding/investor/page.tsx`
- Create: `src/components/onboarding/investor/investor-onboarding.test.ts`

**Interfaces:**
- Produces screens 0–7, literal Investor/Fund Manager signup metadata, authenticated hydration/save/resume, deferred KYC review/completion copy, and `/profile` completion navigation.

- [ ] Write tests for screen order, role metadata, field-to-payload mapping, non-advancement on save failure, Save and exit, disabled KYC, and prototype-switcher feature flag.
- [ ] Run targeted tests and confirm failure.
- [ ] Implement the controller from Appendix A using the shared primitives and authenticated APIs.
- [ ] Run targeted and full tests until green.

### Task 7: Founder onboarding and private document interaction

**Files:**
- Create: `src/components/onboarding/founder/founder-onboarding.types.ts`
- Create: `src/components/onboarding/founder/FounderOnboarding.tsx`
- Create: `src/app/onboarding/founder/page.tsx`
- Create: `src/components/onboarding/founder/founder-onboarding.test.ts`

**Interfaces:**
- Produces screens 0–6, literal Founder signup metadata, user/startup mappings, three document categories, review, completion, and `/profile` navigation.

- [ ] Write tests for screen order, exact Founder copy, startup mappings, accepted document categories, upload errors, completion checklist, and Save and exit.
- [ ] Run targeted tests and confirm failure.
- [ ] Implement Founder onboarding solely from shared visual primitives and the Founder APIs.
- [ ] Run targeted and full tests until green.

### Task 8: Role-aware profile and public CTA integration

**Files:**
- Create: `src/app/profile/page.tsx`
- Create: `src/components/onboarding/profile/ProfileView.tsx`
- Modify: `src/app/investors/page.tsx`
- Modify: `src/app/founders/page.tsx`
- Create: `src/components/onboarding/profile/profile.test.ts`

**Interfaces:**
- Produces authenticated role-selected profiles, source-compatible empty states, and direct public CTA routes.

- [ ] Write tests asserting Investor/Founder/Admin selection, incomplete-onboarding redirects, no fabricated investment claims, and exact CTA destinations.
- [ ] Run targeted tests and confirm failure.
- [ ] Implement server-owned profile loading and role-aware presentation; change only CTA `href` values on public pages.
- [ ] Run targeted and full tests until green.

### Task 9: Final verification

**Files:**
- Verify all files from Tasks 1–8.

**Interfaces:**
- Produces passing unit, type, lint, production-build, and route smoke-test evidence without contacting a live Supabase project.

- [ ] Run `npm test` and record the passing test count.
- [ ] Run `npm run typecheck` and resolve every error.
- [ ] Run `npm run lint` and resolve every error without redesigning source markup.
- [ ] Run `npm run build` with Supabase variables unset and confirm all routes compile.
- [ ] Start the production server locally; confirm `/onboarding/investor`, `/onboarding/founder`, and public pages return successfully, `/onboarding/admin` returns `404`, and unauthenticated `/profile` redirects safely.
- [ ] Review `git diff --check`, `git status --short`, and the final diff to ensure unrelated existing deletions remain untouched.
