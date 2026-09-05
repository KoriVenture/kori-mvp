# Kori MVP — Repository Agent Contract

## 1. Scope and authority

This file applies to the entire repository unless a deeper `AGENTS.md` explicitly overrides a narrower subtree.

`main` is the production branch and the production architecture described here is the target state of the repository.

Kori is a root-level Next.js App Router application. Do not recreate a historical monorepo, Turborepo, pnpm workspace, or any other removed architecture unless an explicitly approved task requires it.

When a task names an approved execution specification such as `kori-u-supa.md`, that specification is an implementation command for the scoped change.

## 2. Execution mode

For an approved implementation specification:

1. Execute the specification; do not write a replacement plan.
2. Do not brainstorm alternate architectures unless the specification is internally impossible or unsafe.
3. Apply its CREATE, REPLACE, MODIFY, MOVE, and DELETE actions.
4. Inspect the repository only to reconcile concrete current-file differences and dependencies.
5. Do not ask for confirmation for ordinary edits or deletions that the approved specification explicitly requires.
6. Do not silently broaden scope.
7. If a command or test fails, diagnose the concrete failure, fix it, and continue.
8. Stop only for a hard blocker such as an unavailable required secret, an external Dashboard action, an unsafe/destructive data decision not covered by the specification, or a required repository asset that is missing and has no complete replacement source in the active specification.
9. Never delete or overwrite user/business data merely to make a migration pass.
10. Finish with execution evidence: changed files, deleted files, packages changed, commands run, and verification results.

Do not return a new architecture proposal when the requested work is already specified.

## 3. Product boundary

Kori is a cross-border investment coordination platform.

Current MVP implementation must distinguish between implemented capabilities, approved capabilities being implemented, future product vision, and deferred capabilities. Never present planned functionality as already available.

Human authorization remains authoritative for investment decisions, governance, custody, capital movement, and legally binding actions. AI may support analysis and evidence workflows but must not autonomously approve investments, move funds, sign transactions, or make legally binding decisions.

## 4. Current application architecture

```text
Browser
  |
  v
Next.js 16 App Router
  |
  +-- Public Kori site
  |
  +-- Authenticated onboarding/profile
          |
          v
      Supabase Auth
          |
          v
      auth.users.id
          |
          v
      profiles.id
          |
          +-- investor_profiles
          +-- founder_profiles
          +-- onboarding_progress
          +-- agreement_acceptances
          +-- startups
          +-- startup_documents

Supabase PostgreSQL
  +-- Row Level Security using auth.uid()

Supabase Storage
  +-- profile-photos
  +-- startup-data-room
```

Canonical identity invariant:

```text
auth.users.id = profiles.id
```

Do not add an external identity-subject mapping layer.

## 5. Authentication

Supabase Auth is the sole authentication system for this target architecture.

Approved account flows include email + password, email confirmation by OTP, Google OAuth, LinkedIn OIDC, Supabase sessions in cookies for SSR, and Supabase passkeys when explicitly enabled for the environment.

Do not introduce a second authentication platform or competing new-user identity store.

Passwords, OTP values, OAuth secrets, passkey private material, and MFA secrets must never be stored in Kori business tables.

Use the browser Supabase client only in Client Components for interactive auth operations. Use the server Supabase client and `auth.getUser()` for server authorization decisions. Do not trust client-submitted user IDs, roles, or profile IDs.

The Next.js proxy refreshes Supabase auth cookies. It is not a business-authorization layer.

## 6. Kori roles

Business roles live in:

```text
profiles.roles[]
```

Current roles are `investor`, `founder`, and `admin`.

Public onboarding may provision only `investor` and `founder`. Never expose public admin self-registration.

A user may hold multiple business roles. Adding one role must not remove another.

A Fund Manager is an Investor subtype:

```text
profiles.roles includes "investor"
investor_profiles.investor_type = "fund_manager"
```

## 7. Database and RLS

Use Supabase PostgreSQL directly through the Supabase JavaScript SDK. Do not add an ORM unless a later approved architecture explicitly requires one.

RLS must remain enabled on user-owned/sensitive tables. Use direct ownership expressions such as:

```sql
profiles.id = auth.uid()
investor_profiles.user_id = auth.uid()
founder_profiles.user_id = auth.uid()
onboarding_progress.user_id = auth.uid()
agreement_acceptances.user_id = auth.uid()
startups.primary_founder_user_id = auth.uid()
startup_documents.uploaded_by_user_id = auth.uid()
```

Never solve an RLS problem by disabling RLS. Never use a service-role key in browser code.

## 8. Migration discipline

Database migration history is immutable after it has been applied to a shared environment. Do not rewrite, rename, or delete an already-applied migration merely because its architecture was later superseded. Use a new forward migration to restore/change schema state.

Migrations must preserve existing UUID identities where valid, fail safely on identity ambiguity, never auto-link accounts only because email addresses match, avoid destructive data loss, and include post-migration checks when identity/RLS changes.

## 9. KYC/KYB status

KYC/KYB is deferred for the current MVP onboarding implementation.

Therefore:
- no KYC screen;
- no KYC route;
- no KYC provider SDK;
- no KYC vendor API;
- no fake verification process;
- no `Verified` claim without actual verification.

Use:

```text
verification_status = deferred
```

Eligibility self-declarations are not identity verification.

## 10. Investor onboarding visual source of truth

For the current Investor onboarding refactor, `kori-u-supa.md` contains the complete extracted visual implementation contract.

When that specification is the active task:
- implement its numeric geometry, exact copy, colors, typography, control sizes, local assets, states and responsive rules directly;
- do not require access to an external design file, design URL, external design identifier or design-tool account;
- do not reinterpret the source design;
- do not replace the Kori UI with a vendor-provided auth widget;
- do not invent missing interaction states.

The canonical desktop baseline is 1440px wide with a 520px editorial panel, a 920px form panel, 48px editorial padding, 80px right-panel horizontal padding and a 560px form width. Screen-specific heights and positions are defined in `kori-u-supa.md`.

## 11. Onboarding assets

Use only the local assets listed by the active execution specification. For new vector assets whose complete source is embedded in the specification, create the local SVG files exactly from that source.

Do not add temporary or external design-asset URLs to application code. Do not discover replacement assets when the specification already provides them. Network connector lines for the Investor onboarding are CSS primitives as specified.

## 12. Styling

There is one handwritten application stylesheet:

```text
src/app/globals.css
```

Do not add CSS Modules, component `.css` files, styled-components, Emotion, or a second global stylesheet.

The public-site CSS must not be unintentionally restyled while updating onboarding.

Core colors:

```text
ivory       #F7F3EC
paper       #FFFDF8
sand        #E8E0D5
forest      #0B3332
plum        #5F5974
cocoa       #564C47
midnight    #030C12
ink         #1C1B1B
ink-soft    #6B665E
orange      #F98515
coral       #F5513E
teal        #049C9F
cyan        #0590C6
peach       #FFDCC4
lilac       #F0DCEF
```

Investor onboarding uses progress orange `#FF9815`; do not normalize it to another orange.

Fonts: Manrope, Fraunces, IBM Plex Mono, and Caveat where the existing public design uses it.

## 13. TypeScript and React

Application source under `src/` is TypeScript: `.ts` and `.tsx`. Do not add `.js` application modules under `src/`.

Keep strict TypeScript behavior. Server Components are the default. Add `"use client"` only when browser state, effects, events, browser APIs, or interactive Supabase Auth APIs require it.

Keep server-only secrets and server-only database authorization out of Client Components.

## 14. Next.js

Current framework: Next.js 16 App Router, React 19, root-level application, and `src/proxy.ts` for proxy/session work.

Use App Router conventions: `page.tsx`, `layout.tsx`, `route.ts`, and explicit server/client boundaries. Do not recreate Pages Router API routes.

## 15. Package management

Use npm.

Canonical commands:

```bash
npm install
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Do not add pnpm, Yarn, Turborepo, or workspace configuration unless explicitly approved.

Do not hand-edit `package-lock.json` after dependency changes. Regenerate it with npm. Remove obsolete packages when their final runtime/source reference is removed.

## 16. Public-site runtime files

Files under `public/` may be active runtime assets even when they are JavaScript. The `.ts/.tsx` rule applies to application source under `src/`, not public static scripts.

Before deleting an asset or script, verify references. Preserve the current public marketing-site animation/form behavior unless the task explicitly changes it.

## 17. API authorization

Every authenticated API route must derive the current user from Supabase Auth, derive ownership from server-side data, validate request payloads, enforce the required Kori business role, and reject cross-user resource access.

Never accept a client-provided `userId` as authorization proof.

Use status semantics consistently: 400 invalid input, 401 unauthenticated, 403 unauthorized role/access, 404 owned resource not found, 409 workflow conflict when appropriate, and 500 unexpected server failure.

Do not leak secrets or raw database internals in API error responses.

## 18. Validation

Use Zod for non-trivial API payload validation. Validate enums, maximum lengths, URLs, arrays, agreement state, document MIME types and sizes, and role values.

Client validation improves UX; server validation is authoritative.

## 19. Storage

`profile-photos` permits public read in the current MVP and authenticated owner-only write/delete under the user's UUID folder. Validate PNG/JPEG and maximum size before upload.

`startup-data-room` is private. A Founder may access only their owned namespace/startup data. Verify startup ownership before upload, validate MIME type and size, and never generate public URLs for private documents.

## 20. Security

Never commit service-role keys, OAuth client secrets, SMTP credentials, private API keys, or production tokens. Only browser-safe values may use `NEXT_PUBLIC_*`.

Do not log passwords, full tokens, secrets, private document contents, or sensitive identity material.

## 21. Financial and compliance claims

Do not imply that current MVP screens execute investments, custody funds, connect live capital rails, guarantee eligibility, perform regulatory verification, or provide investment advice.

Do not publish a security certification, encryption claim, compliance status, or regulatory status unless it is substantiated for the deployed product.

## 22. Accessibility

Preserve semantic controls and keyboard accessibility while matching the embedded visual contract. Interactive elements must use buttons/links appropriately, have visible focus states and usable labels, preserve keyboard order, and avoid inaccessible fake controls.

## 23. Responsive implementation

Where the execution specification provides exact responsive geometry, reproduce it. Where it provides only the 1440px desktop baseline, preserve that desktop contract and use the specified conservative responsive fallback without claiming invented mobile geometry is source-exact.

## 24. Testing

Auth/onboarding changes require authentication tests, authorization/RLS tests, onboarding persistence tests, two-user isolation tests, upload ownership tests where applicable, and numeric visual-contract verification for Investor screens.

A build passing is not enough to prove RLS or visual fidelity.

## 25. Verification before completion

Before declaring a scoped implementation complete, run as applicable:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Also search for stale architecture references after a migration. Runtime source must contain no references to a removed external auth system or its environment variables.

Inspect actual command output before reporting success.

## 26. Change discipline

Keep unrelated public pages and functionality unchanged.

Delete code only when the approved specification explicitly supersedes it or dependency/reference inspection proves it is orphaned.

Do not leave dead imports, parallel auth flows, compatibility shims for removed architecture, stale generated controllers, duplicate business logic, or obsolete package configuration.

If a file is replaced by a new authoritative implementation, remove the old implementation rather than leaving two competing paths.

## 27. Completion report

For an execution task, report files created, files replaced, files deleted, packages added/removed/upgraded, migrations added, commands executed, exact lint/typecheck/test/build results, external Dashboard/manual actions still required, and concrete blockers if any.

Do not substitute a new plan for this report.

## 28. Current Stellar reference

New blockchain work targets Stellar/Soroban. Before changing blockchain code or
application integration, read:

```text
packages/stellar-contracts/AI_CONTEXT.md
packages/stellar-contracts/PRD.md
packages/stellar-contracts/README.md
```

Use `deployments/testnet-v1.json` and `TESTNET_ASSURANCE_REPORT.md` for verified
Testnet claims, Soroban source and tests for enforced behavior, and the PRD for
accepted product intent. The FigJam board is a visual reference, not deployment
evidence. Historical EVM, Sepolia, MetaMask, and Safe material does not define
the active blockchain implementation.

No private signing key belongs in the active reference tree. Any historically
exposed Testnet fixture is permanently compromised and must never be reused.
Operators must use secure local Stellar identities and never reuse them for
Mainnet.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
