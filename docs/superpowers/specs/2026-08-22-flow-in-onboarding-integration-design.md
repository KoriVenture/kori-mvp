# Flow-in MVP Onboarding Integration Design

**Date:** 2026-08-22

**Status:** Approved in chat

**Source specifications:**

- `/Users/whererubeen/Downloads/flow-in(1).md`
- `/Users/whererubeen/Downloads/flow.md`

## Objective

Add production-shaped Investor and Founder onboarding to the existing Kori Next.js App Router site without redesigning either the public site or the supplied onboarding visual source. The deliverable includes authentication integration, authenticated onboarding APIs, resumable progress, role-specific profiles, SQL migrations, storage policies, and public CTA routing. It is configured for Supabase but does not connect to or mutate a live Supabase project in this task.

## Scope

Included:

- `/onboarding/investor`
- `/onboarding/founder`
- `/profile`
- `/auth/callback`
- `GET` and `PATCH` onboarding APIs for Investor and Founder
- authenticated Founder document upload API
- email/password signup, email verification OTP, Google OAuth, and LinkedIn OIDC wiring
- TOTP authenticator and SMS-backup enrollment wiring when supported and enabled by the connected Supabase project
- passkey UI behind a disabled-by-default feature flag
- resumable onboarding drafts and progress
- Investor, Fund Manager, Founder, and manually provisioned Admin role behavior
- database, trigger, RLS, and storage migrations
- source-faithful onboarding assets and namespaced CSS
- public Investor and Founder CTA updates

Excluded:

- community membership
- deals, diligence, milestones, capital rails, wallets, or multisig
- KYC-provider integration
- public Admin signup or `/onboarding/admin`
- deployment or execution of migrations against a live Supabase project
- visual-regression and end-to-end acceptance suites explicitly paused by `flow-in(1).md`

## Approach

Use a server-owned Supabase integration. Client components own transient form interaction and call narrow authenticated route handlers. Route handlers validate inputs with Zod, derive the user identity from the Supabase cookie session, and persist only records owned by that user. Browser code never receives a service-role key and never chooses a database user ID.

This is preferred over direct browser persistence because it centralizes validation, authorization, error mapping, and onboarding status transitions. A UI-only prototype is rejected because it would not implement the requested authentication, persistence, save/resume, uploads, or profile behavior.

## Existing Public Site

The public App Router pages and their source-faithful legacy animation system remain intact. The integration changes only:

- the Investor CTA destination to `/onboarding/investor`;
- the Founder CTA destination to `/onboarding/founder`;
- `src/app/globals.css`, by appending namespaced onboarding rules;
- `eslint.config.mjs`, by disabling only `@next/next/no-html-link-for-pages`, because full-document anchors are an explicit fidelity requirement of the existing public-site migration.

No public-site JSX is converted to `next/link`, and no existing public styling values are changed.

## Routes and Access

| Route | Access | Responsibility |
|---|---|---|
| `/onboarding/investor` | Public before signup; session-aware afterward | Investor/Fund Manager account creation and onboarding screens 0–7 |
| `/onboarding/founder` | Public before signup; session-aware afterward | Founder account creation and onboarding screens 0–6 |
| `/profile` | Authenticated | Server-selected Investor, Founder, or Admin profile |
| `/auth/callback` | Public callback | Exchange OAuth/email code and redirect to an allowlisted onboarding/profile path |
| `/api/onboarding/investor` | Authenticated | Hydrate and save Investor onboarding data |
| `/api/onboarding/founder` | Authenticated | Hydrate and save Founder/startup onboarding data |
| `/api/onboarding/founder/documents` | Authenticated Founder | Upload a private startup document and persist its metadata |

The Founder document endpoint is included even though it is missing from the architecture tree in `flow-in(1).md`, because the same document explicitly requires that endpoint in its API scope.

The root `proxy.ts` refreshes Supabase sessions. It protects `/profile`; each API route independently rejects unauthenticated requests. Onboarding pages remain reachable without a session so account creation can begin.

## Component Boundaries

### Shared visual primitives

`src/components/onboarding/shared/` contains:

- `Editorial.tsx`: left editorial/evidence panel;
- `Shell.tsx`: progress, save-and-exit, form, and actions frame;
- `Field.tsx`: labeled text, email, password, URL, number, and textarea controls;
- `SelectField.tsx`: source-styled select control;
- `Chips.tsx`: multi-select chips;
- `Choice.tsx`: single-choice cards;
- `Completion.tsx`: reusable completion layout and checklist.

Refactoring the Appendix A component into these files may change component boundaries, but it must preserve the rendered DOM structure, class names, content hierarchy, plain `<img>` elements, and CSS values.

### Investor

`InvestorOnboarding.tsx` owns the exact screen sequence:

1. Account
2. Security
3. Profile
4. Preferences
5. Eligibility
6. Review
7. Complete
8. User profile

The prototype screen switcher renders only when `NEXT_PUBLIC_SHOW_FIGMA_SCREEN_SWITCHER=true`; the default is false. Fund Manager uses this same flow with `role=investor` and `investor_type=fund_manager`.

The KYC section remains visible but disabled. Completion stores `verification_status=deferred`, shows eligibility as self-declared, and never calls a KYC service.

### Founder

`FounderOnboarding.tsx` reuses the shared visual primitives for:

1. Account
2. Security
3. Founder Profile
4. Startup Profile
5. Startup Documents
6. Review
7. Complete

No new design system or visual language is introduced. Founder-specific markup is composed from the same form sections, review cards, action rows, progress UI, and completion layout as the Investor source.

### Profiles

`/profile` is a server page. It reads `users.role` and selects:

- an Investor profile based on the Appendix A UserProfile design;
- a Founder profile using the same Kori profile/onboarding primitives;
- a minimal Admin entry that states that Admin access is manually provisioned and exposes no onboarding controls.

Hardcoded portfolio, contribution, mutual-context, wallet, KYC-complete, and similar prototype claims are not rendered as real data. Sections without supported records use source-compatible empty states.

## Assets and CSS

Assets are copied byte-for-byte into:

```text
public/assets/onboarding/shared/
public/assets/onboarding/investor/
```

Shared icons are stored under `shared`; Investor avatars, completion art, cover, and profile photo are stored under `investor`. Component constants use these new URLs. No asset is resized, recompressed, renamed, converted, or rendered through `next/image`.

Every onboarding selector is prefixed by `.kori-onboarding`. The wrapper itself adds no layout declarations. Global source selectors are adapted as follows without changing declaration values:

- `:root` typography/color declarations move to `.kori-onboarding`;
- `*` becomes `.kori-onboarding *`;
- `button,input,select` becomes `.kori-onboarding button`, `.kori-onboarding input`, and `.kori-onboarding select`;
- every remaining class selector is descendant-scoped under `.kori-onboarding`;
- media-query declarations and breakpoints remain unchanged.

The existing Tailwind import and Google font import remain singletons in `globals.css`; duplicate imports from Appendix B are not added.

## Authentication Flow

### Email/password

The Account screen calls Supabase signup with a role metadata literal selected by the route, never a client-controlled arbitrary role. Allowed values are `investor` and `founder`. The database trigger maps any other or missing value to `investor` and never grants `admin`.

The Security screen verifies the email signup OTP. After a session exists it exposes these factor states:

- authenticator/TOTP is available;
- SMS backup is shown when `NEXT_PUBLIC_ENABLE_SMS_MFA=true` and the connected project supports phone MFA;
- passkey remains visible but disabled when `NEXT_PUBLIC_ENABLE_PASSKEY=false`. This task does not enable the flag because the supplied specification names no WebAuthn server/provider; enabling a functional passkey flow requires a separate provider design rather than an invented client-only implementation.

### OAuth

Google uses Supabase provider `google`; LinkedIn uses `linkedin_oidc`. OAuth redirects to `/auth/callback` with an allowlisted `next` value. The callback exchanges the authorization code for a session and accepts redirects only to `/onboarding/investor`, `/onboarding/founder`, or `/profile`, preventing open redirects.

### Missing configuration

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are optional at build time but required for live authentication and persistence. Without them:

- onboarding pages render fully;
- auth actions show a clear configuration message;
- onboarding APIs return a JSON `503` response;
- `/profile` redirects unauthenticated or unconfigured requests to `/join`; authenticated users with incomplete records are redirected to the onboarding route matching their stored role;
- no placeholder production credential is committed.

An `.env.example` documents all variables from `flow-in(1).md`.

## Draft and Persistence Flow

Each onboarding controller holds a typed draft in React state. When an authenticated screen loads, its `GET` API hydrates the draft and saved screen. Unsaved form interaction remains local until Continue or Save and exit.

Continue performs:

1. client-side field validation;
2. authenticated `PATCH` with the current screen and relevant section;
3. server-side Zod validation;
4. idempotent upserts into the owned profile/startup/agreement records;
5. progress update;
6. advance only after success.

Save and exit performs the same save, then navigates to `/`. A returning authenticated user reloads the saved draft and `current_screen`.

Completion marks the role profile `completed`, sets `completed_at`, updates progress, and routes the primary action to `/profile`.

## API Contracts

### Investor

`GET /api/onboarding/investor` returns owned user profile fields, Investor fields, agreements, verification status, and progress.

`PATCH /api/onboarding/investor` accepts a discriminated payload containing `screen` and one or more of `profile`, `preferences`, `eligibility`, `agreements`, or `complete`. It rejects non-Investor users. Investor classification and risk acknowledgement are self-declared. The server forces verification status to `deferred` regardless of client input.

### Founder

`GET /api/onboarding/founder` returns owned user profile fields, Founder progress, the founder-owned startup, agreements, and document metadata.

`PATCH /api/onboarding/founder` accepts `screen` and one or more of `profile`, `startup`, `agreements`, or `complete`. It rejects non-Founder users and derives `founder_user_id` from the authenticated session.

`POST /api/onboarding/founder/documents` accepts multipart form data with `startupId`, `documentType`, `title`, and `file`. It allows only `pitch_deck`, `company_overview`, or `supporting_document`; verifies startup ownership; enforces a 10 MB limit and an allowlist of PDF, DOC, DOCX, PNG, and JPEG MIME types; uploads to a user/startup-scoped private path; and inserts metadata only after a successful upload. A metadata failure triggers best-effort deletion of the uploaded object.

## Database and Storage

The supplied SQL is divided into:

- `001_onboarding.sql`: extensions, enums, tables, indexes, and the auth-user trigger;
- `002_onboarding_rls.sql`: RLS enablement and user-owned policies;
- `003_onboarding_storage.sql`: private buckets and user/startup-scoped object policies.

The trigger provisions `users`, `user_profiles`, the matching role profile, and `onboarding_progress`. It accepts only Founder or Investor metadata and never assigns Admin.

APIs use the authenticated user client, so RLS remains effective. No service-role client is needed. `updated_at` is set explicitly by save operations. Migrations are added to the repository but not executed because no Supabase project or CLI is configured.

## Error Handling

- Validation failures return `400` with field-safe messages.
- Missing sessions return `401`.
- Role mismatches and resource ownership failures return `403`.
- Missing records return `404`.
- Missing Supabase configuration returns `503`.
- Unexpected persistence/storage failures return a generic `500` and are logged without request bodies, signatures, tokens, or personal profile values.

Client screens retain entered values on recoverable errors and expose an accessible status region. A failed save does not advance the screen. Duplicate saves are safe because profile/startup/progress records use deterministic owned keys or upserts.

## Verification

Node 22.22.2 is available, so tests use the built-in Node test runner and type-strippable TypeScript; no test framework dependency is added. Tests cover:

- role metadata allowlisting and Admin rejection;
- Investor and Founder Zod validation;
- server-forced KYC deferral;
- UI-to-database payload mapping;
- allowlisted callback redirects;
- document type, MIME, size, and ownership validation;
- missing-environment `503` behavior;
- progress and completion transitions.

Project verification runs:

```text
npm test
npm run typecheck
npm run lint
npm run build
```

Runtime smoke checks confirm public rendering of both onboarding routes without credentials, controlled API failures without credentials, callback rejection of unsafe redirects, CTA destinations, authenticated-route protection, and absence of `/onboarding/admin`.

No live OAuth, MFA, storage, RLS, or database acceptance claim is made until a Supabase project is connected and the migrations are executed.
