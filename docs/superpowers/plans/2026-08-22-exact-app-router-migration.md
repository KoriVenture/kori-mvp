# Exact App Router Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the previous Kori Next.js rebuild with the exact App Router migration specified by `/Users/whererubeen/Downloads/kori-m(1).md`.

**Architecture:** Preserve the authoritative legacy JavaScript and binary assets byte-for-byte while translating the specified pages into server-rendered App Router routes. Shared framing is limited to `SiteHeader`, `SiteFooter`, and `SiteFrame`; all handwritten styling remains in one global stylesheet, and normal anchor navigation intentionally reinitializes the unchanged legacy animation script.

**Tech Stack:** Next.js 16.3.2, React 19.2.8, TypeScript 5.9, Tailwind CSS/PostCSS 4.3.3, ESLint 9.

**Spec:** `/Users/whererubeen/Downloads/kori-m(1).md`

## Global Constraints

- Treat Git commit `1edf13ccab0be9d17bfb0d7b1028f7fb7934abb0` from `KoriVenture/public_landing_page` as the authoritative legacy snapshot.
- Require asset tree `708d27333052a5dc5d643d62a3e953bb0ca41f85`.
- Preserve `public/kori.js` as blob `03c6634d97df83a62e736e636bcabbd1a2981c46`.
- Preserve `public/join-form.js` as blob `b9c16172aae677a8d2038f50af123a822c038ef9`.
- Keep all handwritten CSS in `src/app/globals.css`; do not add CSS modules or an animation library.
- Use normal `<a>` navigation and plain `<img>` elements exactly as specified.
- Exclude the obsolete investor dashboard, onboarding, and profile prototype routes.
- Remove the older root-level static site and prototype artifacts excluded by the target architecture, after preserving a temporary recoverable backup.
- The target folder has no `.git` directory, so no worktree or commit step is possible.

---

### Task 1: Prove the migration contract fails against the old rebuild

**Files:**
- Inspect: `src/app/`
- Inspect: `public/kori.js`
- Inspect: `public/join-form.js`
- Inspect: `public/assets/`

**Interfaces:**
- Consumes: the current previous-generation rebuild.
- Produces: a recorded RED result proving that obsolete routes, old script bytes, or missing current assets violate the new contract.

- [ ] **Step 1: Run the structural contract before implementation**

```bash
test ! -d src/app/investor-dashboard
test ! -d src/app/investor-onboarding
test ! -d src/app/investor-profile
test "$(git hash-object public/kori.js)" = "03c6634d97df83a62e736e636bcabbd1a2981c46"
test "$(git hash-object public/join-form.js)" = "b9c16172aae677a8d2038f50af123a822c038ef9"
test -f public/assets/how-kori-works-hero.png
test -f public/assets/fadjiah-color-pencil.png
test -f public/assets/ailiza-color-pencil.png
test -f public/assets/lionel-color-pencil.png
test -f public/assets/brice-color-pencil.png
test -f public/assets/tunde-color-pencil.png
```

Expected: FAIL against the previous rebuild because the excluded prototype routes still exist, `public/kori.js` is from the older snapshot, and the current PNG assets have not yet been copied.

### Task 2: Apply the canonical generated migration

**Files:**
- Create or replace: `.gitignore`, `README.md`, `eslint.config.mjs`, `next-env.d.ts`, `next.config.ts`, `package.json`, `postcss.config.mjs`, `supabase-waiting-list.sql`, `tsconfig.json`
- Create or replace: `public/join-form.js`, `public/kori.js`, `public/assets/**`
- Create or replace: every `src/app/**` and `src/components/**` file listed under “Complete file contents” in the specification
- Remove: `src/app/investor-dashboard/`, `src/app/investor-onboarding/`, `src/app/investor-profile/`, `src/components/Atmosphere.tsx`, `src/components/Footer.tsx`, `src/components/Header.tsx`, `src/components/InteriorHero.tsx`, `src/components/PageChrome.tsx`, `src/components/Reveal.tsx`, `src/components/SectionHeading.tsx`, `src/lib/navigation.ts`, `src/lib/site.ts`
- Remove after backing up: root `*.html`, legacy root CSS/JS, root `assets/`, `robots.txt`, `sitemap.xml`, `vercel.json`, `pnpm-lock.yaml`, and `tsconfig.tsbuildinfo`

**Interfaces:**
- Consumes: the exact fenced file bodies in `/Users/whererubeen/Downloads/kori-m(1).md` and asset tree `708d27333052a5dc5d643d62a3e953bb0ca41f85` from the verified temporary clone.
- Produces: the canonical nine-route App Router application plus framework metadata routes and 37 byte-identical public assets.

- [ ] **Step 1: Replace each named text file with its complete fenced body**

Use the file path in each `### \`path\`` heading as the destination and the immediately following fenced block as the entire file body. This is a mechanical application of generated source; no rewriting, formatting, or interpretation is permitted.

- [ ] **Step 2: Back up and remove excluded legacy/static paths**

Copy the exact excluded paths listed in this task’s **Files** section to `/private/tmp/kori-m-pre-exact-migration-20260822/`, then remove them from the target project. Retain project documentation and process reports.

- [ ] **Step 3: Copy the verified authoritative asset tree**

```bash
cp -R /private/tmp/kori-public-landing-page-source-20260822/assets/. public/assets/
```

- [ ] **Step 4: Install the pinned dependency graph**

```bash
npm install
```

Expected: `package-lock.json` reflects the exact `package.json` dependency versions and install exits successfully.

### Task 3: Verify source fidelity and application behavior

**Files:**
- Verify: all outputs from Task 2
- Create: `.superpowers/sdd/2026-08-22-exact-app-router-migration/verification-report.md`

**Interfaces:**
- Consumes: the canonical migration from Task 2.
- Produces: passing structural, static-analysis, production-build, and runtime evidence.

- [ ] **Step 1: Re-run the structural contract**

Run the Task 1 command unchanged.

Expected: PASS.

- [ ] **Step 2: Verify canonical text bodies and binary identities**

Extract each fenced file body from the specification to a temporary comparison directory, compare every named destination byte-for-byte, verify the two script blob hashes, and verify `public/assets` as Git tree `708d27333052a5dc5d643d62a3e953bb0ca41f85`.

- [ ] **Step 3: Run static checks**

```bash
npm run typecheck
npm run lint
```

Expected: both commands exit successfully. Intentional plain `<img>` warnings may be reported by Next.js lint rules but must not be errors.

- [ ] **Step 4: Run a production build**

```bash
npm run build
```

Expected: Next.js compiles all application and metadata routes successfully.

- [ ] **Step 5: Smoke-test runtime routes and public assets**

Start `npm run start` on an available local port, request `/`, all eight interior routes, `/robots.txt`, `/sitemap.xml`, both public scripts, and all required PNGs, and confirm the removed investor prototype routes return 404.

- [ ] **Step 6: Record verification evidence**

Write the exact commands, exit codes, route status results, and any environment limitations to `.superpowers/sdd/2026-08-22-exact-app-router-migration/verification-report.md`.
