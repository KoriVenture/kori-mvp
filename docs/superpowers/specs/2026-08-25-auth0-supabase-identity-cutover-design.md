# Auth0 + Supabase Identity Cutover Design

**Date:** 2026-08-25

**Status:** Approved for implementation planning

## Purpose

Replace Supabase Auth as Kori's onboarding identity and session boundary with Auth0 while retaining Supabase for PostgreSQL, row-level security, Storage, and Realtime. The cutover must preserve Kori's internal UUID-based domain model and the existing investor and founder onboarding persistence flows.

This is an MVP authentication integration. It does not activate real investments, fund custody, financial decisions, KYC, wallets, Safe transactions, or payment rails.

## Scope

The repository change will:

- install `@auth0/nextjs-auth0` version 4.27.0;
- make Auth0 middleware own the `/auth/*` routes through `src/proxy.ts`;
- authenticate server-side Supabase requests with the Auth0 ID token;
- map an Auth0 subject to Kori's internal `profiles.id` UUID;
- bootstrap investor and founder identities through a database RPC;
- replace the onboarding Account and Security steps with Auth0-backed experiences;
- preserve the current business persistence logic for investor, founder, startup, document, progress, and agreement data;
- update `/profile` to resolve the authenticated Kori profile through Auth0 and the identity mapping;
- add the supplied, rerunnable Supabase migration to repository history;
- remove the superseded Supabase Auth callback, cookie proxy, and browser authentication calls; and
- add and update automated tests, then run the repository validation suite.

The following require operator access and are not executable solely from this repository:

- creating and configuring the Auth0 application, connections, factors, and Post Login Action;
- enabling Auth0 Third-Party Auth in Supabase;
- applying and verifying the SQL migration against the live Supabase project;
- configuring deployment environment variables;
- running multi-user RLS, provider, MFA, passkey, and Preview-environment acceptance tests.

These steps remain documented prerequisites for a production-ready deployment.

## Architecture

Auth0 is the only identity and authentication authority for newly migrated onboarding users. It owns email/password, email verification OTP, Google and LinkedIn login, passkey enrollment, MFA challenges, and enterprise organization login.

Supabase remains the data platform. Kori sends the Auth0 ID token to Supabase's Third-Party Auth integration. The ID token must contain the literal claim `role=authenticated`, which selects the PostgreSQL role; Kori business roles remain in `profiles.roles[]`.

Kori retains `profiles.id UUID` as its internal identity. The database maps the JWT subject through `profiles.auth0_user_id TEXT UNIQUE`, while `profiles.supabase_user_id UUID` preserves an explicit legacy mapping. All downstream foreign keys continue to reference `profiles.id`.

The authenticated request path is:

```text
Auth0 Universal Login
  -> Auth0 callback handled by the Next.js SDK proxy
  -> Auth0 server session
  -> Auth0 ID token supplied to the Supabase client
  -> Supabase validates the token
  -> current_profile_id() maps JWT sub to profiles.id
  -> RLS evaluates against the Kori UUID
```

Public onboarding bootstrap accepts only `investor` and `founder`. Admin remains manually provisioned.

## Components

### Auth0 session boundary

`src/lib/auth0.ts` will create the server-only `Auth0Client`. `src/proxy.ts` will delegate requests to Auth0 middleware and replace the root Supabase cookie-refresh proxy. Auth0 will own `/auth/callback`, so the current Supabase callback route will be removed.

### Supabase clients

The server client will require an Auth0 session and pass its ID token to `@supabase/supabase-js` through `accessToken`. It will disable Supabase session persistence and refresh behavior. A separate anonymous client will remain available for explicitly public operations.

The browser client will become anonymous-only and will no longer expose onboarding calls to `supabase.auth`. If `@supabase/ssr` has no remaining imports after the cutover, it will be uninstalled.

### Identity bootstrap and authorization

`bootstrapOnboardingIdentity` will call the `bootstrap_kori_identity` RPC and validate that it returns a Kori profile UUID. The bootstrap API will require an Auth0 session, validate the requested public role, create an authenticated Supabase client, and return the normalized Auth0 security state.

`requireRole` will:

1. require an Auth0 session;
2. create an authenticated Supabase client;
3. call `current_profile_id()`;
4. load the Kori profile and business roles; and
5. return the Kori UUID, Auth0 user claims, and Supabase client only when the requested role is present.

Authentication failures return `401`, missing bootstrap state returns `409`, absent roles return `403`, and profile read failures return `500`.

### Onboarding UI

The Account step will retain Kori's role, email, country, consent, Google, and LinkedIn interface, but it will never collect or store a password. It will save non-secret pre-auth state in `sessionStorage` and redirect to Auth0 Universal Login.

After Auth0 redirects to `/onboarding/{role}?auth=complete`, the controller will call the bootstrap API, restore the saved pre-auth state, load the role-specific onboarding data, and remove the completion query parameter.

The Security step will display Auth0's email verification state, offer Auth0 passkey enrollment where supported, and link to an Auth0 reauthentication/MFA flow. Kori will not store passwords, OTPs, TOTP seeds, SMS secrets, or recovery codes.

Screens after Account and Security will retain their current markup and persistence behavior.

### Domain APIs and profile page

Investor and founder `PATCH` handlers remain unchanged except for compilation adjustments proven necessary by tests. Their `GET` handlers will expose Auth0 email and verification state while continuing to load data by the Kori profile UUID.

The founder document route keeps its existing business behavior and inherits the new authenticated Supabase client through `requireRole`.

`/profile` will require an Auth0 session, resolve `current_profile_id()`, verify the requested Kori role, enforce completed onboarding for investor or founder profiles, and render the existing role-specific profile view.

## Database Migration and RLS

The supplied `Kori-auth-supabase.sql` will be copied unchanged to `supabase/migrations/004_auth0_identity.sql` so repository history matches the SQL intended for execution.

The migration will:

- add Auth0 and legacy identity columns to `profiles`;
- remove only foreign keys from `profiles` to `auth.users`;
- preserve downstream Kori UUID foreign keys;
- add `current_profile_id()` and `bootstrap_kori_identity(role)`;
- reject public Admin bootstrap;
- preserve multi-role profiles and legacy Supabase identities;
- replace onboarding and Storage policies that depend on `auth.uid()`;
- preserve public read for profile photos and private access for the startup data room; and
- include post-migration validation checks.

Automatic account linking by email is explicitly excluded because equal email strings are not sufficient proof that two identities belong to the same person.

## Error and Recovery Behavior

Unauthenticated onboarding visitors remain on the Account step. Authentication and bootstrap errors appear in the existing onboarding message area without discarding pre-auth inputs. Unsupported or cancelled passkey enrollment produces a status message and does not block alternative Auth0 factors.

The SQL migration is transactional and rerunnable, but operators must back up Supabase before execution and run its verification queries. The repository implementation must not claim that live Auth0, Supabase, RLS, provider, MFA, or passkey configuration has succeeded when only local static validation is available.

## Testing

Implementation will follow test-driven development where behavior can be exercised locally. Automated coverage will include at minimum:

- bootstrap RPC delegation, successful UUID handling, invalid results, and RPC errors;
- deterministic Auth0 authorization-link construction for email, Google, LinkedIn, security reauthentication, and organizations;
- role validation and any newly extracted pure authentication helpers;
- regression coverage for existing onboarding contracts; and
- compile-time validation of Auth0 SDK and Supabase client integration.

Local validation will run:

```text
npm run lint
npm run typecheck
npm test
npm run build
```

Live completion additionally requires the authentication matrix in `Kori-auth.md`, including email/password and OTP, Google, LinkedIn, passkey, enabled MFA factors, both onboarding roles, two-user RLS isolation, and deployment Preview testing.

## Out of Scope

This cutover does not implement KYC vendors, community lifecycle, deal lifecycle, SPVs, wallets, multisig integration, diligence, milestones, capital releases, payment rails, automatic legacy-account linking, or production ID-token refresh policy for long-running sessions.

The stale package-manager and monorepo description in `AGENTS.md` is not changed as part of this authentication cutover. The implementation follows the executable `feature/nbrand` repository state and its existing npm lockfile, consistent with the validated attachment.

## Acceptance Criteria

The local repository implementation is complete when:

- Auth0 owns the Next.js authentication routes and no competing Supabase callback remains;
- onboarding contains no Supabase Auth calls or local password/OTP handling;
- authenticated Supabase requests use the Auth0 ID token;
- Kori domain operations continue to use `profiles.id` UUIDs;
- public bootstrap accepts investor and founder but not Admin;
- the supplied migration exists at `supabase/migrations/004_auth0_identity.sql`;
- existing investor and founder persistence logic is preserved;
- the local lint, typecheck, test, and build commands pass; and
- any remaining live configuration and acceptance checks are reported accurately as operator work.
