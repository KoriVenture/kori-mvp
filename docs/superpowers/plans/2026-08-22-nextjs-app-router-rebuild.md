# Kori Next.js App Router Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the current static Kori website as the exact Next.js App Router application specified in `/Users/whererubeen/Downloads/kori-m.md`.

**Architecture:** Use the specification's shared App Router layout, reusable page chrome and content helpers, one route module per legacy HTML page, and one client-side `Atmosphere` component for all canvas, scroll, cursor, background, and reveal behavior. Preserve all handcrafted styling in `src/app/globals.css` and migrate the original asset directory byte-for-byte to `public/assets/`.

**Tech Stack:** Next.js 16.3.2, React 19.2, TypeScript 5.9, Tailwind CSS 4.3, ESLint 9, Vercel Analytics, browser Canvas and IntersectionObserver APIs.

**Spec:** `/Users/whererubeen/Downloads/kori-m.md`

## Global Constraints

- Treat sections 2–34 of the spec as canonical file contents; do not reinterpret or rewrite their code or copy.
- All handcrafted CSS must live only in `src/app/globals.css`.
- Do not introduce CSS Modules, styled-components, Emotion, inline `<style>` elements, or component-level stylesheet imports.
- Do not add an animation package; retain the custom browser animation logic.
- Preserve every asset byte-for-byte under `public/assets/` with its original filename.
- Preserve the specified semantic class names, routes, metadata, typography, navigation, content structure, animation timing, and responsive behavior.
- Use Node.js 22+ and npm 10+ for installation and validation.
- This workspace has no `.git` repository, so each task ends with a verification checkpoint instead of a commit.

---

### Task 1: Establish the Next.js project shell and migrate assets

**Files:**
- Create: `package.json`
- Create: `postcss.config.mjs`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `eslint.config.mjs`
- Create: `public/assets/*`

**Interfaces:**
- Consumes: Exact configuration blocks from spec sections 2–6 and the existing `assets/` directory.
- Produces: The npm scripts `dev`, `build`, `start`, `lint`, and `typecheck`; the `@/*` alias; and stable `/assets/<filename>` public URLs.

- [ ] **Step 1: Record the legacy asset manifest and hashes**

```bash
find assets -type f -print0 | sort -z | xargs -0 shasum -a 256
```

Expected: one SHA-256 line for every file currently under `assets/`.

- [ ] **Step 2: Replace the project configuration with the exact spec contents**

Use the complete fenced blocks under sections `2. package.json`, `3. postcss.config.mjs`, `4. next.config.ts`, `5. tsconfig.json`, and `6. eslint.config.mjs` without additions or substitutions.

- [ ] **Step 3: Move the complete asset directory into the public tree**

```bash
mkdir -p public
mv assets public/assets
```

- [ ] **Step 4: Verify asset parity**

```bash
find public/assets -type f -print0 | sort -z | xargs -0 shasum -a 256
```

Expected: filenames and hashes exactly match Step 1, with only the `public/` path prefix added.

- [ ] **Step 5: Install the locked dependency graph**

```bash
npm install
```

Expected: installation succeeds and `package-lock.json` describes the dependency versions requested by `package.json`.

### Task 2: Add shared site data and chrome components

**Files:**
- Create: `src/lib/site.ts`
- Create: `src/lib/navigation.ts`
- Create: `src/components/Header.tsx`
- Create: `src/components/Footer.tsx`
- Create: `src/components/PageChrome.tsx`
- Create: `src/components/InteriorHero.tsx`
- Create: `src/components/Reveal.tsx`
- Create: `src/components/SectionHeading.tsx`

**Interfaces:**
- Consumes: The `@/*` alias and public asset URLs from Task 1.
- Produces: `site`, `primaryNavigation`, `footerNavigation`, `Header`, `Footer`, `PageChrome`, `InteriorHero`, `Reveal`, and `SectionHeading` with the exact exports and props from spec sections 7–10 and 12–15.

- [ ] **Step 1: Run the compiler before the source tree exists**

```bash
npm run typecheck
```

Expected: FAIL because the App Router source and imported shared modules do not exist yet.

- [ ] **Step 2: Add exact shared data modules**

Create `src/lib/site.ts` and `src/lib/navigation.ts` from spec sections 7 and 8 verbatim.

- [ ] **Step 3: Add exact shared chrome components**

Create `Header.tsx`, `Footer.tsx`, and `PageChrome.tsx` from spec sections 9, 10, and 12 verbatim.

- [ ] **Step 4: Add exact editorial helpers**

Create `InteriorHero.tsx`, `Reveal.tsx`, and `SectionHeading.tsx` from spec sections 13–15 verbatim.

- [ ] **Step 5: Check exact export and import names**

```bash
rg -n 'export (const site|const primaryNavigation|const footerNavigation|function Header|function Footer|function PageChrome|function InteriorHero|function Reveal|function SectionHeading)' src/lib src/components
```

Expected: all nine specified exports are present and route imports can resolve through `@/*`.

### Task 3: Port the interaction and animation engine

**Files:**
- Create: `src/components/Atmosphere.tsx`

**Interfaces:**
- Consumes: DOM nodes with IDs `net`, `veil`, `ghostc`, `cur`, and `progress`; sections carrying `data-bg` and `data-dark`; `.anim-text-up`; and `[data-draw]` SVGs.
- Produces: `Atmosphere({ ghostSrc?: string })`, with lifecycle-safe setup and cleanup for canvas animation, scroll progress, background painting, pointer tethers, content reveals, and SVG drawing.

- [ ] **Step 1: Confirm the shared chrome import is unresolved**

```bash
npm run typecheck
```

Expected: FAIL with a missing `@/components/Atmosphere` module from `PageChrome.tsx`.

- [ ] **Step 2: Add the exact client component**

Create `src/components/Atmosphere.tsx` from the complete fenced block in spec section 11, preserving every constant, threshold, event listener, cleanup function, and JSX node.

- [ ] **Step 3: Verify client lifecycle coverage**

```bash
rg -n '"use client"|requestAnimationFrame|cancelAnimationFrame|IntersectionObserver|removeEventListener|prefers-reduced-motion|ghostSrc' src/components/Atmosphere.tsx
```

Expected: the client boundary, animation loop, observer paths, cleanup paths, reduced-motion path, and optional collage path are all present.

### Task 4: Build the root layout and public editorial routes

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/how-kori-works/page.tsx`
- Create: `src/app/about/page.tsx`
- Create: `src/app/founders/page.tsx`
- Create: `src/app/investors/page.tsx`
- Create: `src/app/communities/page.tsx`
- Create: `src/app/collective-intelligence/page.tsx`
- Create: `src/app/join/page.tsx`
- Create: `src/app/privacy/page.tsx`
- Create: `src/app/terms/page.tsx`

**Interfaces:**
- Consumes: Shared data, components, and public assets from Tasks 1–3.
- Produces: App Router pages for `/`, `/how-kori-works`, `/about`, `/founders`, `/investors`, `/communities`, `/collective-intelligence`, `/join`, `/privacy`, and `/terms`.

- [ ] **Step 1: Confirm route entry points are absent**

```bash
npm run typecheck
```

Expected: FAIL because `src/app/layout.tsx` and route entry points have not yet been added.

- [ ] **Step 2: Add the exact root layout and metadata**

Create `src/app/layout.tsx` from spec section 16 verbatim, including all four `next/font/google` families, metadata, icon, and Vercel Analytics.

- [ ] **Step 3: Add the exact landing route**

Create `src/app/page.tsx` from spec section 17 verbatim.

- [ ] **Step 4: Add the exact audience and explanatory routes**

Create route files from spec sections 18–23 verbatim for How Kori Works, About, Founders, Investors, Communities, and Collective Intelligence.

- [ ] **Step 5: Add the exact conversion and legal routes**

Create route files from spec sections 24–26 verbatim for Join, Privacy, and Terms.

- [ ] **Step 6: Verify every route exports a page**

```bash
rg -l 'export default function' src/app/page.tsx src/app/*/page.tsx | sort
```

Expected: the root page and all ten public route files created in this task are listed.

### Task 5: Add the investor application routes

**Files:**
- Create: `src/app/investor-dashboard/page.tsx`
- Create: `src/app/investor-onboarding/page.tsx`
- Create: `src/app/investor-profile/page.tsx`

**Interfaces:**
- Consumes: Shared App Router layout, shared components, and global semantic classes.
- Produces: Client-side investor dashboard, onboarding, and profile pages with the exact state and event behavior in spec sections 27–29.

- [ ] **Step 1: Confirm investor route modules are absent**

```bash
test ! -e src/app/investor-dashboard/page.tsx && test ! -e src/app/investor-onboarding/page.tsx && test ! -e src/app/investor-profile/page.tsx
```

Expected: exit status 0.

- [ ] **Step 2: Add the exact investor dashboard page**

Create `src/app/investor-dashboard/page.tsx` from spec section 27 verbatim.

- [ ] **Step 3: Add the exact investor onboarding page**

Create `src/app/investor-onboarding/page.tsx` from spec section 28 verbatim.

- [ ] **Step 4: Add the exact investor profile page**

Create `src/app/investor-profile/page.tsx` from spec section 29 verbatim.

- [ ] **Step 5: Verify required client boundaries and state hooks**

```bash
rg -n '"use client"|useState|useMemo|onSubmit|onChange' src/app/investor-dashboard/page.tsx src/app/investor-onboarding/page.tsx src/app/investor-profile/page.tsx
```

Expected: each interactive page exposes the exact client and state patterns specified for it.

### Task 6: Add platform routes, metadata endpoints, and global styling

**Files:**
- Create: `src/app/not-found.tsx`
- Create: `src/app/robots.ts`
- Create: `src/app/sitemap.ts`
- Create: `src/app/globals.css`
- Create: `src/app/icon.svg`

**Interfaces:**
- Consumes: `site.url`, all semantic class names in Tasks 2–5, and `/assets/kori_app_icon.svg`.
- Produces: the 404 page, robots metadata, sitemap entries, global design system and page styles, and App Router icon.

- [ ] **Step 1: Confirm global CSS is absent**

```bash
test ! -e src/app/globals.css
```

Expected: exit status 0.

- [ ] **Step 2: Add exact framework route files**

Create `not-found.tsx`, `robots.ts`, and `sitemap.ts` from spec sections 30–32 verbatim.

- [ ] **Step 3: Add the exact global stylesheet**

Create `src/app/globals.css` from the full 1,716-line CSS fenced block in spec section 33 without moving any declaration to component files.

- [ ] **Step 4: Add the App Router icon without altering bytes**

Copy `public/assets/kori_app_icon.svg` to `src/app/icon.svg` byte-for-byte.

- [ ] **Step 5: Enforce the single-stylesheet constraint**

```bash
find src -type f \( -name '*.css' -o -name '*.scss' -o -name '*.module.*' \) -print
```

Expected: only `src/app/globals.css`.

### Task 7: Replace project documentation and validate the production build

**Files:**
- Create: `README.md`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: The complete application from Tasks 1–6.
- Produces: Exact setup and validation documentation plus a reproducible installed dependency graph.

- [ ] **Step 1: Replace the README with exact spec prose**

Create `README.md` from spec section 34, preserving its Requirements, Install, Development, Production validation, Assets, Styling, and Animation architecture sections.

- [ ] **Step 2: Run TypeScript validation**

```bash
npm run typecheck
```

Expected: exit status 0 with no TypeScript diagnostics.

- [ ] **Step 3: Run lint validation**

```bash
npm run lint
```

Expected: exit status 0 with no ESLint errors.

- [ ] **Step 4: Run the optimized build**

```bash
npm run build
```

Expected: exit status 0 and all static App Router routes listed successfully.

- [ ] **Step 5: Verify required route inventory**

```bash
find src/app -name page.tsx -print | sort
```

Expected: exactly the 13 page entry points from the target architecture.

- [ ] **Step 6: Verify the asset migration remained lossless**

```bash
find public/assets -type f -print0 | sort -z | xargs -0 shasum -a 256
```

Expected: the same file count and SHA-256 values recorded in Task 1.

### Task 8: Perform browser-level visual and interaction verification

**Files:**
- Inspect only: all routes and rendered assets.

**Interfaces:**
- Consumes: Production-ready application from Task 7.
- Produces: Evidence that desktop, mobile, motion, navigation, and scroll behaviors match the specification checklist.

- [ ] **Step 1: Start the application locally**

```bash
npm run dev
```

Expected: the development server reports a local URL and serves the App Router application.

- [ ] **Step 2: Verify desktop rendering**

Open `/`, `/about`, `/how-kori-works`, `/founders`, `/investors`, `/communities`, `/collective-intelligence`, `/join`, `/privacy`, `/terms`, and all three investor routes at a desktop viewport.

Expected: no console errors, no broken images, all content is visible, and navigation resolves without `.html`.

- [ ] **Step 3: Verify scroll and pointer behavior**

On `/`, scroll from the 100vh hero to the bottom and back upward while moving the pointer across the constellation.

Expected: nodes move with scroll, pointer tethers react, the progress bar reaches 100%, room backgrounds and logo treatments reverse correctly, reveal animations run once, and the collage appears only through its specified scroll range.

- [ ] **Step 4: Verify mobile behavior**

Repeat the route and navigation checks below 900px viewport width.

Expected: mobile navigation introduces no layout shifts and `landing-collage.webp` is not requested.

- [ ] **Step 5: Verify reduced motion**

Enable `prefers-reduced-motion: reduce`, reload `/`, and scroll through the page.

Expected: content remains visible and usable, canvas animation is not started, and SVG drawings do not remain hidden.
