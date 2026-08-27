# Kori MVP — Agent Instructions

## 1. Purpose

This file defines how AI coding agents must work inside the entire Kori MVP repository.

These instructions apply to the entire repository unless a more specific `AGENTS.md` exists deeper in the directory tree.

`main` is the production branch.

This document describes the **target production architecture of `main` after the current major refactor is integrated**.

The refactor replaces the former production monorepo structure with the root-level Next.js architecture defined in this document.

Agents must implement toward this production architecture rather than recreating the legacy monorepo solely because older files or documents still reference it.

During the migration period, executable code may temporarily exist outside `main`, but temporary development-branch names and implementation mechanics are intentionally not part of this repository contract.

The primary goals are:

- preserve the intended Kori product model;
- preserve the current architecture unless a task explicitly changes it;
- avoid inventing functionality that does not exist;
- maintain strong authentication, authorization, data-security, and financial-system boundaries;
- keep changes focused and reviewable;
- treat investment, identity, AI, blockchain, custody, and payment functionality as high-risk areas;
- verify changes before declaring them complete.

Kori is evolving rapidly.

Agents must distinguish between:

1. what is implemented now;
2. what is approved for implementation;
3. what exists only in the product vision;
4. what remains experimental or deferred.

Never present planned functionality as already implemented.

---

# 2. Product Definition

Kori is a cross-border investment coordination platform.

Its long-term purpose is to connect:

- collective intelligence;
- investment diligence;
- governance;
- legally structured investment participation;
- settlement;
- milestone-based capital deployment;
- post-investment accountability.

Kori is not merely:

- a crowdfunding portal;
- a deal marketplace;
- a wallet;
- a stablecoin application;
- a blockchain payment application;
- an AI investment advisor.

The product vision is to build trust infrastructure connecting the investment lifecycle from market intelligence to accountable capital deployment.

---

# 3. Core Product Principles

The following principles are fundamental and must not be changed accidentally.

## 3.1 Human governance

Kori is human-governed.

AI may:

- investigate;
- analyze;
- organize evidence;
- identify inconsistencies;
- identify missing information;
- summarize;
- challenge assumptions;
- generate recommendations;
- assign or suggest confidence indicators.

AI must never autonomously:

- approve an investment;
- reject an investment;
- authorize a capital release;
- sign a blockchain transaction;
- move funds;
- change governance rights;
- make legally binding decisions;
- impersonate a human approver.

The core rule is:

> AI investigates, challenges and recommends. Humans decide and authorize.

Any future AI architecture must preserve this boundary.

---

## 3.2 Evidence over unsupported claims

Investment conclusions must remain traceable to evidence whenever possible.

Systems should distinguish between:

- verified evidence;
- unverified claims;
- assumptions;
- opinions;
- missing information;
- AI-generated conclusions;
- human conclusions;
- consensus;
- disagreement.

Do not silently convert an assertion into a fact.

---

## 3.3 Legal structures remain authoritative

Blockchain does not replace:

- contracts;
- SPVs;
- securities law;
- investor agreements;
- regulatory requirements;
- custody requirements;
- governance agreements;
- dispute procedures;
- human authorization.

On-chain execution must be treated as an infrastructure layer supporting legally authorized actions.

Do not create product copy or architecture suggesting that smart contracts replace legal rights.

---

## 3.4 Sensitive information remains private

Sensitive information should remain off-chain unless an approved architecture explicitly requires otherwise.

Examples include:

- identity information;
- KYC/KYB data;
- passports;
- government IDs;
- beneficial ownership data;
- investor eligibility information;
- private diligence documents;
- financial statements;
- confidential company information;
- personal information.

If blockchain verification is required, prefer storing:

- hashes;
- references;
- proofs;
- identifiers;
- authorization records;

rather than raw sensitive information.

---

# 4. Source of Truth

Do not treat every document in the repository as equally authoritative.

Use the following rules.

## Technical truth

`main` is the production branch and the authoritative destination for the architecture defined by this document.

During an active migration, the executable working tree being used for the refactor is the primary source of truth for the implementation being prepared for `main`.

Inspect:

- `package.json`;
- `package-lock.json`;
- source code;
- tests;
- database migrations;
- CI configuration;
- runtime configuration;
- current approved architecture specifications.

Do not infer the target production architecture from stale monorepo documents.

Do not recreate removed legacy structure unless an explicitly approved architectural decision reintroduces it.

---

## Approved implementation designs

For a feature with an approved design under:

```text
docs/superpowers/specs/
```

the relevant approved specification describes the intended target behavior for that feature.

Associated implementation plans may exist under:

```text
docs/superpowers/plans/
```

Do not apply a specification to unrelated areas of the application.

---

## Product truth

The Kori white paper describes product direction, business concepts, and long-term intent.

It does not prove that a capability has already been implemented.

Never infer implementation status solely from the white paper.

For example, the white paper may describe:

- SPVs;
- stablecoin settlement;
- milestone releases;
- AI diligence;
- blockchain governance;
- expert networks;
- fund managers;
- incubators;
- custody;
- payment infrastructure.

Those concepts remain product vision until supported by executable code or an explicitly approved implementation task.

---

## Visual migration rules

`README.md` contains important fidelity constraints for portions of the application migrated from the historical Kori website.

Respect those constraints when modifying those surfaces.

---

# 5. Current Repository Architecture

The target production application is a **root-level Next.js application**.

This is the architecture that `main` is expected to use after the current major refactor is integrated.

The historical pnpm/Turborepo monorepo architecture is being replaced.

Do not recreate legacy directories such as:

```text
apps/web/
packages/ui/
packages/domain/
packages/web3/
```

unless an explicitly approved future architecture migration requires them.

The production structure is approximately:

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docs/
│   └── superpowers/
│       ├── plans/
│       └── specs/
│
├── public/
│   ├── assets/
│   ├── kori.js
│   └── ...
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── onboarding/
│   │   ├── profile/
│   │   ├── investors/
│   │   ├── founders/
│   │   └── ...
│   │
│   ├── components/
│   │   ├── onboarding/
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── onboarding/
│   │   ├── supabase/
│   │   ├── validation/
│   │   └── auth0.ts
│   │
│   └── proxy.ts
│
├── supabase/
│   └── migrations/
│
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── AGENTS.md
```

Follow this structure unless the task explicitly changes the production architecture.

---

## Legacy architecture

Older versions of Kori used a pnpm/Turborepo monorepo with:

```text
apps/
packages/
pnpm-workspace.yaml
pnpm-lock.yaml
turbo.json
```

Those files may still appear in historical documentation, Git history, old specifications, or intermediate migration artifacts.

They are **not** the target architecture defined by this document.

Do not:

- recreate the monorepo because older documentation references it;
- restore removed package boundaries without an approved reason;
- use pnpm because historical CI used it;
- reintroduce old dashboard or i18n architecture without reconciling it with the current production design.

Historical implementation is reference material, not an instruction to reverse the refactor.

---

## Production migration responsibility

Because this architecture replaces a prior production structure, agents working on migration tasks must verify that important production capabilities are either:

```text
ported
replaced
explicitly deferred
explicitly removed by product decision
```

Do not silently lose a production capability merely because its old implementation lived in the legacy monorepo.

Capabilities requiring explicit reconciliation may include:

- internationalization;
- dashboards;
- simulator behavior;
- contracts;
- Web3 integration scaffolding;
- AI scaffolding;
- observability;
- shared design-system behavior;
- SEO/metadata;
- accessibility;
- CI/CD behavior.

---

# 6. Current Technology Stack

The target production repository uses:

- Next.js 16;
- React 19;
- TypeScript;
- Tailwind CSS 4;
- Auth0;
- Supabase;
- Zod;
- Vercel Analytics;
- ESLint;
- npm.

Always inspect `package.json` for exact installed versions.

The current refactor uses a root-level Next.js application rather than the historical Turborepo workspace.

Do not upgrade framework or dependency versions unless:

- the task explicitly requests it;
- a security fix requires it;
- or the change has been discussed and approved.

Installed dependencies do not prove that a capability is fully configured or production-ready.

---

# 7. Package Manager

Use **npm**.

The target production repository uses:

```text
package-lock.json
```

Do not use:

```text
pnpm
yarn
bun
```

unless an explicitly approved repository migration changes the package manager.

Do not create:

```text
pnpm-lock.yaml
yarn.lock
bun.lock
bun.lockb
```

Run commands from the repository root.

For CI/reproducible installation use:

```bash
npm ci
```

For local dependency installation use:

```bash
npm install
```

To add a dependency:

```bash
npm install <package>
```

Development dependency:

```bash
npm install --save-dev <package>
```

Before installing a new package, check whether the repository already contains the required functionality.

Avoid dependencies for trivial functionality.

Historical pnpm configuration belongs to the previous repository architecture and should not be restored without explicit approval.

---

# 8. Node.js

CI for the refactored production architecture currently targets Node.js 22.

Changes must remain compatible with the Node version configured by the production repository and CI.

Always verify:

```text
package.json
.github/workflows/ci.yml
```

before introducing runtime assumptions.

Do not introduce a different Node.js requirement without updating and validating the full toolchain.

---

# 9. Next.js Architecture

The project uses the Next.js App Router.

Application routes belong under:

```text
src/app/
```

API handlers belong under:

```text
src/app/api/
```

Use Next.js conventions rather than creating a parallel routing framework.

Do not recreate the historical:

```text
apps/web/app/
```

layout unless an approved future migration changes the repository architecture.

---

## Server Components by default

Prefer Server Components.

Do not add:

```tsx
"use client";
```

unless the component actually requires browser-side behavior such as:

- React state;
- event handlers;
- browser APIs;
- effects;
- sessionStorage;
- DOM APIs;
- client-only libraries.

Keep client boundaries as small as possible.

Do not turn an entire page into a Client Component simply because one child needs interactivity.

---

## Server-only modules

Authentication, privileged database operations, secrets, and sensitive infrastructure should remain server-side.

Use:

```ts
import "server-only";
```

where appropriate.

Never import server-only modules into Client Components.

---

# 10. Next.js Proxy

The project uses the Next.js `proxy` convention through:

```text
src/proxy.ts
```

Auth0 middleware owns the authentication boundary in the target production architecture.

Do not create a competing:

```text
middleware.ts
```

without an explicitly approved migration.

Do not bypass Auth0 middleware for protected functionality without understanding the authentication implications.

---

# 11. Authentication Architecture

Auth0 is the authentication and identity provider for the target production onboarding architecture.

Auth0 is responsible for the authentication boundary.

Kori must not implement its own password system.

Do not store or process application passwords directly.

Do not build custom handling for:

- passwords;
- password hashes;
- OTP secrets;
- TOTP seeds;
- MFA secrets;
- recovery codes;
- passkey secrets.

Use Auth0-supported authentication flows.

---

## Auth0 server boundary

The canonical server Auth0 client is defined in:

```text
src/lib/auth0.ts
```

Use the existing abstraction rather than creating multiple unrelated Auth0 clients.

---

## Auth0 middleware

Auth0's Next.js middleware is delegated through:

```text
src/proxy.ts
```

Do not introduce a competing authentication middleware layer without explicit architectural approval.

---

# 12. Auth0 + Supabase Identity Model

Auth0 authenticates users.

Supabase remains the application data platform.

The authenticated request model is conceptually:

```text
User
  ↓
Auth0
  ↓
Auth0 session
  ↓
Next.js server
  ↓
Auth0 ID token
  ↓
Supabase
  ↓
RLS
  ↓
Kori domain data
```

Do not revert this architecture to Supabase Auth unless explicitly instructed.

---

# 13. Internal Kori Identity

The Kori domain identity must remain independent from external authentication-provider identifiers.

The internal domain uses Kori profile UUIDs.

Conceptually:

```text
Auth0 subject
      ↓
profiles.auth0_user_id
      ↓
profiles.id
      ↓
Kori business relationships
```

Downstream Kori relationships should use:

```text
profiles.id
```

rather than coupling the domain model directly to Auth0 identifiers.

Do not replace internal UUID foreign keys with Auth0 `sub` values.

---

# 14. Account Linking

Do not automatically link identities solely because email addresses match.

Matching email addresses are not sufficient evidence that two identities represent the same person.

Any future legacy-account linking system requires an explicit verified account-linking process.

---

# 15. Current Public Roles

The current implemented public onboarding roles are:

```text
investor
founder
```

Do not assume that all roles described by the white paper are currently supported.

The white paper may describe future participants such as:

- fund managers;
- incubators;
- accelerators;
- domain experts;
- verifiers;
- local operators;
- lead investors;
- compliance partners.

Do not create these roles automatically.

New roles require:

- domain-model design;
- authorization rules;
- RLS review;
- UI workflow;
- API behavior;
- migrations where required;
- tests.

Admin must never become a public self-service signup role accidentally.

---

# 16. Authorization

Authentication and authorization are different concerns.

A valid Auth0 session does not automatically authorize access to Kori data.

Authorization must be enforced server-side.

Never rely only on:

- hidden buttons;
- disabled inputs;
- client routes;
- frontend role checks.

Protected actions must validate permissions at the server/database boundary.

---

## Role checks

Reuse existing role-access helpers when possible.

Do not duplicate authorization logic across route handlers.

For onboarding access, preserve existing semantics around:

- unauthenticated user;
- missing Kori profile;
- unauthorized role;
- server/database failure.

---

# 17. Supabase

Supabase currently provides application data capabilities including:

- PostgreSQL;
- row-level security;
- Storage;
- database RPCs.

Do not treat Supabase as the authentication authority for the migrated architecture.

---

## Authenticated Supabase server client

Authenticated server-side Supabase access uses the Auth0 ID token.

Reuse the implementation in:

```text
src/lib/supabase/server.ts
```

Do not create another authenticated Supabase client that bypasses this model.

---

## Browser Supabase client

The browser-side Supabase client must not become an alternative authentication system.

Do not add:

```ts
supabase.auth.signIn(...)
supabase.auth.signUp(...)
supabase.auth.getSession(...)
```

to restore Supabase Auth behavior.

The browser client should remain appropriate only for explicitly permitted public/client operations.

---

# 18. Row-Level Security

RLS is a critical security boundary.

Never solve an RLS problem by simply:

- disabling RLS;
- using a service role in the browser;
- granting broad table access;
- replacing policies with unrestricted access.

When modifying data access:

1. identify the authenticated actor;
2. identify the Kori profile;
3. identify the role;
4. determine resource ownership or relationship;
5. update RLS deliberately;
6. test cross-user isolation.

A successful API test with one user does not prove RLS is correct.

Where practical, test:

```text
User A cannot access User B's private data.
```

---

# 19. Service Role Keys

Supabase service-role credentials are privileged secrets.

They must never appear in:

- browser code;
- Client Components;
- public JavaScript;
- logs;
- documentation examples with real values;
- committed `.env` files.

Never expose service-role credentials through a `NEXT_PUBLIC_*` variable.

---

# 20. Database Migrations

Database changes belong under:

```text
supabase/migrations/
```

Do not manually modify production database state without a migration unless explicitly performing an operator task.

Prefer new migration files for new schema changes.

Do not silently rewrite an existing migration that may already have been applied.

If an existing migration must be modified:

- verify whether it has been deployed;
- explain the migration implications;
- preserve rerunnability where appropriate.

Never invent:

- tables;
- columns;
- RPC names;
- policy names;

without inspecting the existing database migrations first.

---

# 21. API Routes

API routes must:

- validate authentication where required;
- validate authorization;
- validate request input;
- avoid leaking sensitive errors;
- return explicit HTTP status codes;
- preserve existing Kori domain boundaries.

Use existing route-handler patterns before inventing new ones.

---

## Authentication errors

Use:

```text
401
```

for unauthenticated requests where appropriate.

---

## Authorization errors

Use:

```text
403
```

when an authenticated user lacks the required permission or role.

---

## Workflow-state conflicts

Use:

```text
409
```

where existing Kori workflow semantics require state to exist before continuing.

Example:

```text
Kori profile must be bootstrapped first.
```

---

## Invalid input

Use the repository's established validation conventions.

Do not trust:

```ts
await request.json()
```

without validation.

---

# 22. Validation

Zod is available and should be reused for boundary validation.

Validate untrusted data such as:

- API request bodies;
- query parameters;
- URL parameters;
- IDs;
- role names;
- external-provider responses;
- database responses where assumptions matter.

Prefer schemas or reusable validation helpers over repeated manual checks.

Do not use TypeScript casts as runtime validation.

This is unsafe:

```ts
const user = body as User;
```

Prefer validated parsing.

---

# 23. TypeScript

TypeScript strict mode is enabled.

Preserve it.

Do not weaken:

```json
"strict": true
```

to make a change compile.

Avoid:

```ts
any
```

Prefer:

- explicit interfaces;
- inferred types;
- generics;
- `unknown`;
- Zod parsing.

Do not suppress errors with:

```ts
// @ts-ignore
```

unless there is an exceptional documented reason.

Do not use unsafe assertions to hide incorrect types.

---

# 24. React

Use functional React components.

Prefer small components with clear responsibilities.

Avoid large components containing:

- API logic;
- authentication logic;
- data transformation;
- business rules;
- presentation;

all in one file.

When touching a large existing component, extract behavior only when doing so improves the task at hand.

Do not perform unrelated rewrites.

---

# 25. Existing Code First

Before implementing functionality:

1. inspect the relevant files;
2. search for similar behavior;
3. inspect existing helpers;
4. inspect existing validation;
5. inspect existing tests;
6. inspect relevant migrations;
7. inspect approved feature specifications.

Reuse existing abstractions where possible.

Do not duplicate:

- Auth0 clients;
- Supabase clients;
- role checks;
- validation schemas;
- onboarding contracts;
- HTTP helpers;
- UI components.

---

# 26. Do Not Guess

Never invent project details when the repository can answer the question.

Before assuming something exists, search for it.

Do not invent:

- API routes;
- environment variables;
- Auth0 configuration;
- Supabase tables;
- database columns;
- blockchain contracts;
- wallet providers;
- KYC providers;
- AI providers;
- payment providers;
- roles;
- permissions;
- deployment settings.

If an external system cannot be verified from the repository, state that clearly.

---

# 27. UI Fidelity

Parts of this application were migrated from the historical Kori frontend with strict fidelity requirements.

For existing migrated marketing surfaces:

- do not redesign them casually;
- do not change wording without instruction;
- do not change section order without instruction;
- do not change spacing casually;
- do not change breakpoints casually;
- do not change brand colors casually;
- do not change font stacks casually;
- do not change animation constants casually.

Preserve the original visual intent.

---

# 28. Legacy Animation Behavior

The legacy Kori animation system currently relies on:

```text
public/kori.js
```

Do not replace it with another animation library merely for convenience.

Do not migrate the entire site to:

- Framer Motion;
- GSAP;
- another animation engine;

unless the task explicitly includes such a migration.

Understand existing initialization behavior before changing navigation or animation lifecycle.

---

# 29. Navigation Fidelity

Some existing navigation intentionally uses normal anchors because full document navigation recreates the lifecycle expected by the historical Kori JavaScript.

Do not automatically replace every:

```html
<a>
```

with:

```tsx
<Link>
```

without verifying that client-side navigation does not break animation or DOM initialization.

---

# 30. Images and Assets

The existing Kori assets under:

```text
public/assets/
```

may be fidelity-critical.

Do not casually:

- rename;
- recompress;
- resize;
- regenerate;
- recolor;
- optimize;
- replace;

existing validated brand assets.

Do not convert existing assets to `next/image` solely because it is conventionally recommended.

Pixel and behavioral parity must be preserved for existing migrated surfaces.

For newly built features, `next/image` may be used when appropriate.

---

# 31. CSS

Existing migration CSS is currently authoritative for migrated pages.

Do not perform a repository-wide CSS rewrite while implementing an unrelated feature.

Tailwind is available, but its presence is not permission to rewrite existing visual implementation.

For new components:

- reuse existing Kori visual patterns;
- avoid unexplained one-off values;
- prefer maintainable styling;
- maintain responsive behavior.

---

# 32. Accessibility

New and modified UI must remain accessible.

Use semantic HTML.

Prefer:

```html
button
nav
main
section
header
footer
label
input
```

over generic clickable containers.

Maintain:

- keyboard navigation;
- focus visibility;
- form labels;
- appropriate ARIA usage;
- readable contrast;
- meaningful image alt text;
- status/error announcements where appropriate.

Do not sacrifice accessibility to achieve cosmetic fidelity.

---

# 33. Responsive Design

New interfaces must work across:

- mobile;
- tablet;
- desktop.

Do not implement layouts that only match one screenshot width.

When changing an existing migrated surface, preserve its validated breakpoints unless explicitly redesigning it.

---

# 34. Internationalization

Kori is an international product.

The previous production application contained explicit multilingual behavior for:

```text
en
fr
es
```

The refactored production architecture must not silently lose internationalization capability.

Internationalization may be reimplemented differently from the historical monorepo, but the migration must explicitly decide how multilingual routing, messages, metadata, and user language preferences are preserved.

Do not automatically restore the old `@kori/i18n` package or old route structure solely because it existed previously.

Instead, implement the approved internationalization architecture for the root-level Next.js application.

Do not infer:

```text
language = country
```

or:

```text
language = currency
```

or:

```text
language = jurisdiction
```

Keep explicit concepts separate:

- locale;
- country;
- jurisdiction;
- timezone;
- currency;
- blockchain network;
- stablecoin.

Do not hard-code regulatory assumptions from a selected interface language.

---

# 35. Financial-System Boundary

Kori is an investment-related product.

Financial actions must be treated as high-risk functionality.

Do not introduce real-money behavior as a side effect of another feature.

Any implementation involving:

- investor funds;
- stablecoins;
- fiat payments;
- deposits;
- withdrawals;
- transfers;
- escrow;
- custody;
- investment commitments;
- capital releases;

requires explicit scope and architecture.

---

# 36. Current Funds Status

Do not assume that the current web application handles real funds.

Installed UI, white-paper language, dependencies, or prototype screens do not prove production fund movement exists.

Do not describe the MVP as holding or moving real investment capital unless the implementation and deployment have been explicitly verified.

---

# 37. Money Calculations

When financial calculations are implemented:

Never use binary floating-point arithmetic for authoritative monetary values.

Avoid patterns such as:

```ts
const total = 0.1 + 0.2;
```

Use an explicit monetary representation such as:

- integer minor units;
- token base units;
- decimal-safe arithmetic.

Always make explicit:

- currency;
- asset;
- decimals;
- network where relevant.

Never treat:

```text
100
```

as self-explanatory financial data.

---

# 38. Financial Idempotency

Future endpoints that trigger financial or blockchain actions must be designed against duplicate execution.

Examples:

- deposit;
- withdrawal;
- transfer;
- milestone release;
- investment commitment.

Repeated requests must not accidentally execute the same financial action twice.

Use explicit identifiers and idempotent state transitions when those systems are implemented.

---

# 39. Blockchain Boundary

Do not introduce blockchain technology simply because Kori is blockchain-enabled.

Blockchain should be used where it provides a clear product property such as:

- verifiable execution;
- settlement;
- auditability;
- programmable authorization;
- transparent transaction state.

Keep business and legal logic separate from chain-specific implementation where practical.

---

# 40. Network Awareness

Never assume a blockchain network.

Always distinguish explicitly between environments such as:

```text
local
testnet
mainnet
```

and specific networks when implemented.

Never silently point development code at a production blockchain network.

---

# 41. Smart Contracts

Future smart-contract work must be treated as security-sensitive.

Do not:

- deploy production contracts automatically;
- move real assets during tests;
- embed private keys;
- use production signer credentials;
- skip contract tests;
- introduce upgradeability without explicit design;
- change authorization rules casually.

Changes affecting asset custody or release require focused review.

---

# 42. Wallets and Private Keys

Never store raw private keys in application source code or database records.

Never expose private keys to the browser unless the architecture explicitly uses a user-controlled external wallet.

Never log:

- seed phrases;
- private keys;
- signing secrets;
- custody credentials.

Custody architecture must be explicitly designed.

## Current Stellar reference

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

---

# 43. SPVs and Legal Entities

The product vision includes legally constituted investment vehicles.

Do not treat an application database record as equivalent to a legally formed SPV.

A future SPV lifecycle must distinguish between:

- proposed entity;
- legal formation initiated;
- legally formed entity;
- investors admitted;
- governance active;
- investment executed;
- closed/wound down.

Do not represent legal status that has not actually occurred.

---

# 44. KYC / KYB / AML

KYC/KYB is not a cosmetic onboarding step.

Do not mark a user as verified merely because they:

- created an Auth0 account;
- verified an email address;
- completed a Kori profile.

Authentication verification and regulatory identity verification are different concepts.

Keep concepts separate:

```text
Authentication
Identity verification
KYC
KYB
AML
Sanctions screening
Investor eligibility
Accreditation
```

Do not collapse them into one `verified` boolean.

---

# 45. AI Systems

AI output is untrusted analytical output.

Do not allow model output to directly:

- execute SQL;
- invoke capital transfers;
- approve milestones;
- sign transactions;
- alter permissions;
- modify investor ownership;
- modify governance rights.

AI outputs should pass through deterministic application logic and human authorization before consequential actions.

---

# 46. Uploaded Documents and AI

Documents uploaded to Kori must be treated as untrusted input.

An uploaded PDF, spreadsheet, document, website, or text file may contain malicious instructions.

AI systems analyzing documents must not follow instructions found inside uploaded content as though they were system instructions.

Treat document content as:

```text
data to analyze
```

not:

```text
instructions for the system
```

This is especially important for diligence and investment-document analysis.

---

# 47. AI Evidence Traceability

When implementing Kori's AI intelligence layer, prefer outputs that can answer:

- what evidence supports this conclusion?
- where did the evidence come from?
- who supplied it?
- when was it supplied?
- is it verified?
- what contradicts it?
- what is missing?
- what is the model's confidence?
- what did a human decide?

Avoid AI output that produces unexplained investment scores.

---

# 48. AI and Financial Advice

Do not present AI output as personalized investment, legal, regulatory, or tax advice unless an explicitly approved legal/product framework allows that behavior.

Prefer language such as:

```text
analysis
decision support
risk indicators
evidence summary
unresolved questions
```

rather than:

```text
you should invest
buy this investment
guaranteed opportunity
safe investment
```

---

# 49. Privacy

Collect only data needed for an explicit product purpose.

Avoid logging personal data unnecessarily.

Do not log:

- authentication tokens;
- passwords;
- private keys;
- complete identity documents;
- sensitive financial information;
- secrets.

Mask sensitive identifiers when logs require correlation.

---

# 50. Secrets

Never commit real secrets.

Examples:

```text
AUTH0_SECRET
AUTH0_CLIENT_SECRET
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
PRIVATE_KEY
API_KEY
WEBHOOK_SECRET
```

Use environment variables.

Only variables explicitly safe for browser exposure may use:

```text
NEXT_PUBLIC_
```

Do not assume that adding `NEXT_PUBLIC_` makes a secret safe.

---

# 51. Environment Variables

Before adding a new environment variable:

1. check whether an equivalent already exists;
2. decide whether it belongs server-side or client-side;
3. document its purpose;
4. never commit its production value.

Use placeholders in documentation.

Example:

```env
AUTH0_DOMAIN=your-auth0-domain
```

Never:

```env
AUTH0_CLIENT_SECRET=real-production-secret
```

---

# 52. External Providers

External integrations require explicit boundaries.

Examples include:

- Auth0;
- Supabase;
- KYC providers;
- custody providers;
- payment providers;
- blockchain RPC providers;
- AI providers.

Wrap provider-specific behavior where practical.

Do not spread provider SDK calls throughout presentation components.

Do not claim an external configuration is working merely because repository code exists.

Tenant/dashboard configuration may require separate operator verification.

---

# 53. Error Handling

Do not silently swallow errors.

Avoid:

```ts
try {
  // ...
} catch {
}
```

Use meaningful error handling.

Server logs may contain operational context but must not leak sensitive data.

User-facing error messages should not expose:

- SQL internals;
- stack traces;
- tokens;
- provider secrets;
- raw provider errors containing sensitive information.

---

# 54. Logging

Logs should be useful for operations without exposing confidential information.

Prefer structured context such as:

```text
request ID
operation
resource ID
status
error category
```

Avoid logging complete:

- JWTs;
- Auth0 sessions;
- financial documents;
- government IDs;
- raw KYC responses.

---

# 55. Tests

Behavioral changes should include tests where reasonably possible.

The current root application uses Node's built-in test runner for existing:

```text
*.test.ts
```

patterns.

Look for existing tests before adding a new testing framework.

Do not introduce Jest, Vitest, or another test framework without explicit justification.

If future production areas such as smart contracts require specialized testing tools, keep those tests scoped to that domain and document the toolchain explicitly.

---

## Test important boundaries

Prioritize tests around:

- role authorization;
- onboarding state;
- validation;
- identity mapping;
- authentication helpers;
- database contract logic;
- financial calculations;
- state transitions;
- security-sensitive behavior.

Do not only test happy paths.

Test expected failure modes.

---

# 56. Test-Driven Changes

For business logic and bug fixes, prefer:

1. reproduce or specify behavior with a test;
2. confirm the test fails for the expected reason;
3. implement the smallest correct change;
4. confirm the test passes;
5. refactor if appropriate;
6. run the full relevant validation suite.

Avoid writing tests that merely duplicate implementation details.

---

# 57. CI and Validation

Before considering a task complete, run from the repository root:

```bash
npm run lint
```

then:

```bash
npm run typecheck
```

then:

```bash
npm test
```

then:

```bash
npm run build
```

All checks affected by the change must pass.

CI for the refactored production architecture uses the npm/root-level application toolchain.

Do not restore pnpm/Turborepo CI simply because it existed in the previous production architecture.

Do not claim a task passes validation unless the commands were actually executed successfully.

Report local code validation separately from external-provider verification.

---

# 58. External Verification

Local validation does not prove external infrastructure is configured correctly.

For example, successful:

```bash
npm run build
```

does not prove that:

- Auth0 Google login works;
- LinkedIn login works;
- MFA is enabled;
- passkeys work;
- Supabase RLS is deployed correctly;
- production environment variables exist;
- a KYC provider is configured;
- blockchain transactions work;
- Vercel production configuration is correct.

Report local and external verification separately.

---

# 59. Git Discipline

Keep changes focused.

Do not modify unrelated files.

Do not perform repository-wide formatting for a small feature.

Do not rewrite Git history.

Do not delete files simply because they appear old without verifying whether they remain part of the current migration or deployment workflow.

Before completing a code change, inspect:

```bash
git status
```

and:

```bash
git diff
```

Verify that no unintended files changed.

---

# 60. Branch Safety

`main` is the production branch.

Do not push directly to:

```text
main
```

unless the user explicitly requests it and repository policy allows it.

Prefer temporary development branches and pull requests for meaningful changes.

Temporary branch names must not become architectural concepts documented in product-level files.

Do not create commits, push branches, merge pull requests, or modify GitHub settings unless explicitly requested.

---

## Major-refactor merge safety

The current refactor is a production architecture migration.

Before integrating the refactor into `main`, verify at least:

```text
package manager
Node.js version
root application structure
internationalization
production dashboards
simulator behavior
contracts
Web3
AI
observability
design system
CI
Vercel
Auth0
Supabase
RLS
Storage
environment variables
documentation
```

A capability absent from the refactored working tree is not automatically approved for permanent product removal.

Classify important legacy capabilities as:

```text
ported
replaced
explicitly deferred
explicitly deprecated
```

before completing the production migration.

---

# 61. Dependency Changes

Before adding a package:

1. inspect current dependencies;
2. check whether existing platform functionality solves the problem;
3. assess client bundle impact;
4. assess maintenance/security implications;
5. explain significant additions.

Do not install a library merely because it is popular.

Do not replace existing Auth0, Supabase, validation, or styling infrastructure casually.

---

# 62. Security-Sensitive Dependencies

Pay additional attention to dependencies related to:

- authentication;
- cryptography;
- wallets;
- smart contracts;
- custody;
- KYC;
- payments;
- file parsing;
- AI agents.

Use maintained packages and official provider SDKs where reasonable.

Do not introduce unknown cryptographic implementations.

Never implement custom cryptography when a well-reviewed standard implementation exists.

---

# 63. Refactoring

Do not bundle major unrelated refactors with feature work.

Refactor when:

- it directly improves the requested implementation;
- it removes dangerous duplication;
- it enables testing;
- it fixes a boundary that would otherwise make the feature unsafe.

If the required refactor becomes architectural, surface that fact before expanding scope.

---

# 64. Large Files

Some existing Kori components may be large because they were migrated or evolved quickly.

Do not rewrite them merely because they are large.

When actively modifying a large file:

- understand its responsibilities;
- extract cohesive units where useful;
- preserve behavior;
- keep the refactor connected to the current task.

---

# 65. Documentation

Update documentation when architecture or externally relevant behavior changes.

Do not update documentation to claim functionality that was not implemented.

Distinguish clearly between:

```text
implemented
configured locally
requires operator configuration
planned
experimental
deferred
```

---

# 66. White Paper Changes

Do not modify the product white paper as a side effect of code work.

If implementation diverges materially from the white paper:

- report the discrepancy;
- recommend updating documentation;
- do not silently redefine product strategy in code.

---

# 67. Current Implementation vs Future Vision

The refactored production architecture contains meaningful implementation around:

- Next.js public pages;
- Kori onboarding;
- investor onboarding;
- founder onboarding;
- profile flows;
- Auth0 integration;
- Supabase persistence;
- Supabase migrations;
- role authorization;
- validation;
- RLS-oriented identity handling;
- Storage-backed document/profile workflows.

These capabilities become production capabilities only after they are:

```text
merged to main
configured
deployed
externally verified where applicable
```

Do not infer production completion of the broader Kori investment infrastructure.

Unless explicitly implemented and verified, treat the following as separate future scopes:

- full KYC/KYB;
- sanctions screening;
- investor accreditation;
- SPV lifecycle automation;
- stablecoin settlement;
- fiat on-ramp;
- fiat off-ramp;
- production wallets;
- custody;
- Safe multisig application integration;
- production smart contracts;
- milestone smart-contract releases;
- production capital movement;
- AI diligence providers;
- automated portfolio monitoring;
- on-chain governance;
- real investment execution.

Historical production demonstrations such as dashboards, multilingual routes, simulator behavior, contracts, or package scaffolds must be explicitly ported, replaced, deferred, or deprecated during the refactor.

---

# 68. Feature Implementation Workflow

Before modifying code:

1. read the user request;
2. inspect relevant current files;
3. inspect relevant tests;
4. inspect relevant approved specs;
5. inspect database migrations if persistence is involved;
6. identify security boundaries;
7. identify whether the feature touches financial or regulated behavior;
8. implement only the required scope.

Do not start by creating new files before understanding the existing implementation.

---

# 69. High-Risk Change Checklist

Changes involving any of the following require additional care:

```text
authentication
authorization
RLS
identity
KYC/KYB
payments
stablecoins
smart contracts
wallets
custody
investments
milestone release
AI decision support
private documents
legal agreements
```

For high-risk changes, verify:

- authorization boundary;
- validation boundary;
- data exposure;
- failure behavior;
- auditability;
- testing;
- human approval requirements;
- external configuration requirements.

---

# 70. Definition of Done

A task is complete only when the requested functionality is implemented and the appropriate verification has been performed.

At minimum:

- requested behavior is implemented;
- unrelated behavior remains intact;
- authorization is enforced server-side where required;
- untrusted input is validated;
- sensitive data is not exposed;
- no secrets were committed;
- relevant tests pass;
- TypeScript passes;
- ESLint passes;
- production build passes;
- no unrelated files were modified;
- implementation status is reported accurately.

For normal repository changes run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

If some validation cannot be executed, report exactly what could not be verified.

A change intended for production is not fully complete merely because it works in a temporary development branch.

Production completion may also require:

```text
merge to main
database migration
provider configuration
Vercel configuration
deployment
external acceptance testing
```

---

# 71. Completion Report

When finishing a development task, provide a concise report containing:

## Changed

What behavior changed.

## Files

The important files modified.

## Tests

Tests added or updated.

## Validation

Commands actually executed and their results.

## External work

Anything still requiring:

- Auth0 dashboard configuration;
- Supabase deployment;
- Vercel configuration;
- provider credentials;
- blockchain deployment;
- human review;
- merge to `main`;
- production deployment.

Clearly distinguish between:

```text
implemented
merged to main
configured
deployed
externally verified
```

These states are not interchangeable.

## Limitations

Known remaining limitations or deferred work.

Never state:

```text
fully production ready
```

unless production infrastructure, security controls, external providers, deployment configuration, and relevant acceptance tests have actually been verified.

---

# 72. Final Principle

Kori operates at the intersection of:

```text
identity
collective intelligence
investment
governance
payments
blockchain
AI
```

That makes seemingly small implementation decisions potentially consequential.

Prefer:

```text
evidence over assumptions
explicit authorization over implicit trust
human governance over autonomous financial decisions
server enforcement over UI restrictions
small verified changes over broad speculative rewrites
current repository truth over stale documentation
```

When unsure whether functionality exists:

**inspect the repository before assuming.**
