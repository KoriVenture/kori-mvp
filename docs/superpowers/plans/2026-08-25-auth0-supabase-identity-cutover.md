# Auth0 + Supabase Identity Cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Supabase Auth with Auth0 for Kori onboarding and profile sessions while preserving Supabase data, Kori UUIDs, RLS, Storage, and existing business persistence.

**Architecture:** Auth0 owns authentication and exposes an ID token to server-side Supabase clients. Supabase maps the token subject to `profiles.id` through `current_profile_id()`, while onboarding bootstrap is delegated to `bootstrap_kori_identity(role)` and all domain foreign keys continue to use the Kori UUID.

**Tech Stack:** Next.js 16.3.2, React 19.2.8, TypeScript 5.9, `@auth0/nextjs-auth0` 4.27.0, `@supabase/supabase-js` 2.57.x, PostgreSQL/RLS, Node test runner, npm.

**Spec:** `docs/superpowers/specs/2026-08-25-auth0-supabase-identity-cutover-design.md`

## Global Constraints

- New-user identity authority is Auth0; do not retain competing Supabase Auth calls in onboarding.
- Use the Auth0 ID token for Supabase Third-Party Auth because it contains the literal PostgreSQL claim `role=authenticated`.
- Keep Kori business roles in `profiles.roles[]`; never use `investor`, `founder`, or `admin` as the PostgreSQL `role` claim.
- Keep `profiles.id UUID` and every downstream Kori domain foreign key unchanged.
- Public bootstrap accepts exactly `investor` and `founder`; Admin remains manually provisioned.
- Never collect or store passwords, OTPs, TOTP seeds, SMS secrets, or recovery codes in Kori or Supabase.
- Preserve the existing investor and founder `PATCH` persistence logic and all onboarding screens after Account and Security.
- Keep KYC `verification_status` deferred.
- Copy the supplied SQL migration unchanged; do not claim it was executed against a live Supabase project.
- Use npm from the repository root because this validated branch contains `package-lock.json` and npm-based scripts.
- Do not modify the stale `AGENTS.md` description as part of this cutover.

---

### Task 1: Install Auth0 and Establish the Next.js Session Boundary

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/lib/auth0.ts`
- Create: `src/proxy.ts`
- Delete: `proxy.ts`
- Delete: `src/lib/supabase/proxy.ts`
- Delete: `src/app/auth/callback/route.ts`

**Interfaces:**
- Produces: `auth0: Auth0Client` from `src/lib/auth0.ts`
- Produces: `proxy(request: NextRequest): Promise<NextResponse>` delegated to `auth0.middleware(request)`
- Removes: Supabase cookie refresh and Supabase ownership of `/auth/callback`

- [ ] **Step 1: Add the server boundary before the dependency exists**

Create `src/lib/auth0.ts`:

```ts
import "server-only";

import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client();
```

Create `src/proxy.ts`:

```ts
import type { NextRequest } from "next/server";

import { auth0 } from "./lib/auth0";

export async function proxy(request: NextRequest) {
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
```

- [ ] **Step 2: Run typecheck to verify the missing dependency fails**

Run: `npm run typecheck`

Expected: FAIL with `Cannot find module '@auth0/nextjs-auth0/server'`.

- [ ] **Step 3: Install the pinned Auth0 SDK**

Run: `npm install @auth0/nextjs-auth0@4.27.0`

Expected: `package.json` contains `"@auth0/nextjs-auth0": "^4.27.0"` or the npm-equivalent exact resolved entry, and `package-lock.json` records version 4.27.0.

- [ ] **Step 4: Remove the superseded Auth files**

Delete only:

```text
proxy.ts
src/lib/supabase/proxy.ts
src/app/auth/callback/route.ts
```

Confirm one proxy remains:

Run: `rg --files -g 'proxy.ts' -g '!node_modules'`

Expected: `src/proxy.ts`

- [ ] **Step 5: Verify the new session boundary compiles**

Run: `npm run typecheck`

Expected: PASS, or failures only in files deliberately changed by a later task and not missing Auth0 imports.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/auth0.ts src/proxy.ts proxy.ts src/lib/supabase/proxy.ts src/app/auth/callback/route.ts
git commit -m "feat: establish Auth0 session boundary"
```

---

### Task 2: Build and Test Auth0 Authorization Links

**Files:**
- Create: `src/lib/onboarding/auth-links.ts`
- Create: `src/lib/onboarding/auth-links.test.ts`

**Interfaces:**
- Produces: `PublicRole = "investor" | "founder"`
- Produces: `emailSignupUrl`, `googleLoginUrl`, `linkedinLoginUrl`, `securityReauthUrl`, and `organizationLoginUrl`
- Consumes later: Account/Security onboarding components and controller

- [ ] **Step 1: Write failing authorization-link tests**

Create `src/lib/onboarding/auth-links.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";

import {
  emailSignupUrl,
  googleLoginUrl,
  linkedinLoginUrl,
  organizationLoginUrl,
  securityReauthUrl,
} from "./auth-links.ts";

test("email signup sends Auth0 the role return path and login hint", () => {
  process.env.NEXT_PUBLIC_AUTH0_DATABASE_CONNECTION = "Kori-Users";

  assert.equal(
    emailSignupUrl("investor", "investor@example.com"),
    "/auth/login?returnTo=%2Fonboarding%2Finvestor%3Fauth%3Dcomplete&connection=Kori-Users&login_hint=investor%40example.com&screen_hint=signup",
  );
});

test("social, reauthentication, and organization links remain role-scoped", () => {
  process.env.NEXT_PUBLIC_AUTH0_GOOGLE_CONNECTION = "google-kori";
  process.env.NEXT_PUBLIC_AUTH0_LINKEDIN_CONNECTION = "linkedin-kori";

  assert.equal(
    googleLoginUrl("founder"),
    "/auth/login?returnTo=%2Fonboarding%2Ffounder%3Fauth%3Dcomplete&connection=google-kori",
  );
  assert.equal(
    linkedinLoginUrl("investor"),
    "/auth/login?returnTo=%2Fonboarding%2Finvestor%3Fauth%3Dcomplete&connection=linkedin-kori",
  );
  assert.equal(
    securityReauthUrl("founder"),
    "/auth/login?returnTo=%2Fonboarding%2Ffounder%3Fauth%3Dcomplete&prompt=login",
  );
  assert.equal(
    organizationLoginUrl("investor", "org_123"),
    "/auth/login?returnTo=%2Fonboarding%2Finvestor%3Fauth%3Dcomplete&organization=org_123",
  );
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --experimental-strip-types --test src/lib/onboarding/auth-links.test.ts`

Expected: FAIL because `auth-links.ts` does not exist.

- [ ] **Step 3: Implement the minimal URL builder**

Create `src/lib/onboarding/auth-links.ts` with a private `loginUrl(role, options)` that:

```ts
export type PublicRole = "investor" | "founder";

function loginUrl(
  role: PublicRole,
  options?: {
    connection?: string;
    email?: string;
    signup?: boolean;
    prompt?: string;
    organization?: string;
  },
) {
  const params = new URLSearchParams();
  params.set("returnTo", `/onboarding/${role}?auth=complete`);
  if (options?.connection) params.set("connection", options.connection);
  if (options?.email) params.set("login_hint", options.email);
  if (options?.signup) params.set("screen_hint", "signup");
  if (options?.prompt) params.set("prompt", options.prompt);
  if (options?.organization) params.set("organization", options.organization);
  return `/auth/login?${params.toString()}`;
}
```

Export the five helpers with the connection fallbacks from `Kori-auth.md`:

```ts
export function emailSignupUrl(role: PublicRole, email?: string) {
  return loginUrl(role, {
    signup: true,
    email,
    connection:
      process.env.NEXT_PUBLIC_AUTH0_DATABASE_CONNECTION ||
      "Username-Password-Authentication",
  });
}

export function googleLoginUrl(role: PublicRole) {
  return loginUrl(role, {
    connection:
      process.env.NEXT_PUBLIC_AUTH0_GOOGLE_CONNECTION || "google-oauth2",
  });
}

export function linkedinLoginUrl(role: PublicRole) {
  const connection = process.env.NEXT_PUBLIC_AUTH0_LINKEDIN_CONNECTION?.trim();
  return loginUrl(role, { ...(connection ? { connection } : {}) });
}

export function securityReauthUrl(role: PublicRole) {
  return loginUrl(role, { prompt: "login" });
}

export function organizationLoginUrl(role: PublicRole, organizationId: string) {
  return loginUrl(role, { organization: organizationId });
}
```

- [ ] **Step 4: Run the focused tests**

Run: `node --experimental-strip-types --test src/lib/onboarding/auth-links.test.ts`

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/onboarding/auth-links.ts src/lib/onboarding/auth-links.test.ts
git commit -m "feat: add Auth0 onboarding links"
```

---

### Task 3: Delegate Identity Bootstrap to the Database RPC

**Files:**
- Replace: `src/lib/onboarding/bootstrap.ts`
- Replace: `src/lib/onboarding/bootstrap.test.ts`

**Interfaces:**
- Consumes: `PublicSignupRole` from `src/lib/onboarding/contracts.ts`
- Produces: `bootstrapOnboardingIdentity(client, role): Promise<BootstrapResult>`
- Produces: `{ ok: true; profileId: string } | { ok: false; error: string }`

- [ ] **Step 1: Replace the old test with RPC contract tests**

Write tests that capture calls to:

```ts
client.rpc("bootstrap_kori_identity", { p_role: "investor" });
```

Assert a UUID string produces:

```ts
{
  ok: true,
  profileId: "3fda0d51-35f9-4ccc-89dd-3a0000000001",
}
```

Add separate cases asserting an RPC error produces `{ ok: false, error: error.message }` and a null/empty/non-string result produces:

```ts
{
  ok: false,
  error: "Kori identity bootstrap did not return a profile id.",
}
```

- [ ] **Step 2: Run the focused test and verify the old implementation fails**

Run: `node --experimental-strip-types --test src/lib/onboarding/bootstrap.test.ts`

Expected: FAIL because `bootstrapOnboardingIdentity` is not exported.

- [ ] **Step 3: Replace the bootstrap service**

Implement:

```ts
import type { PublicSignupRole } from "./contracts";

type RpcError = { message: string };
type BootstrapRpcClient = {
  rpc(
    name: "bootstrap_kori_identity",
    args: { p_role: PublicSignupRole },
  ): Promise<{ data: unknown; error: RpcError | null }>;
};

export type BootstrapResult =
  | { ok: true; profileId: string }
  | { ok: false; error: string };

export async function bootstrapOnboardingIdentity(
  client: BootstrapRpcClient,
  role: PublicSignupRole,
): Promise<BootstrapResult> {
  const result = await client.rpc("bootstrap_kori_identity", { p_role: role });
  if (result.error) return { ok: false, error: result.error.message };
  if (typeof result.data !== "string" || !result.data) {
    return {
      ok: false,
      error: "Kori identity bootstrap did not return a profile id.",
    };
  }
  return { ok: true, profileId: result.data };
}
```

- [ ] **Step 4: Run focused and contract tests**

Run: `node --experimental-strip-types --test src/lib/onboarding/bootstrap.test.ts src/lib/onboarding/contracts.test.ts`

Expected: all tests PASS, including rejection of public Admin signup.

- [ ] **Step 5: Commit**

```bash
git add src/lib/onboarding/bootstrap.ts src/lib/onboarding/bootstrap.test.ts
git commit -m "refactor: bootstrap Kori identities through RPC"
```

---

### Task 4: Authenticate Supabase Through the Auth0 ID Token

**Files:**
- Replace: `src/lib/supabase/server.ts`
- Replace: `src/lib/supabase/client.ts`
- Replace: `src/lib/onboarding/http.ts`

**Interfaces:**
- Consumes: `auth0.getSession()`
- Produces: `createClient()` requiring an Auth0 session and ID token
- Produces: `createAnonymousClient()` with no persisted session
- Produces: `requireRole(role)` returning `{ supabase, userId, auth0User, profile }` or `{ error: NextResponse }`

- [ ] **Step 1: Replace the server Supabase client with the Auth0-token design**

Use `createClient as createSupabaseClient` from `@supabase/supabase-js`. `createClient()` must throw `Authentication required.` when there is no Auth0 session and `Auth0 ID token is missing.` when `session.tokenSet.idToken` is absent. Both authenticated and anonymous clients must set:

```ts
auth: {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false,
}
```

The authenticated client adds:

```ts
accessToken: async () => idToken,
```

- [ ] **Step 2: Make the browser client explicitly anonymous**

Replace `createBrowserClient` with `createSupabaseClient` and the same disabled session settings. Do not expose any browser session or Auth API helper.

- [ ] **Step 3: Replace role authorization**

Implement `requireRole` in this order:

```ts
const session = await auth0.getSession();
if (!session) return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };

const supabase = await createClient();
const profileIdResult = await supabase.rpc("current_profile_id");
```

Return `409` with `Kori profile does not exist. Bootstrap onboarding first.` if the RPC fails or returns no profile UUID. Select:

```text
id,roles,verification_status,email,email_verified,auth0_user_id
```

from `profiles` by the resolved UUID. Return `500` on an unreadable profile and `403` if `roles` excludes the required role. On success return:

```ts
{
  supabase,
  userId: profileResult.data.id as string,
  auth0User: session.user,
  profile: profileResult.data,
}
```

Preserve `invalid(error)` with status `400`.

- [ ] **Step 4: Verify forbidden Supabase session APIs are absent from these helpers**

Run: `rg -n 'createServerClient|createBrowserClient|auth\.getUser|auth\.getSession' src/lib/supabase src/lib/onboarding/http.ts`

Expected: no matches.

- [ ] **Step 5: Run typecheck**

Run: `npm run typecheck`

Expected: PASS or only downstream references to the removed `user` property, which Task 5 replaces.

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase/server.ts src/lib/supabase/client.ts src/lib/onboarding/http.ts
git commit -m "feat: authenticate Supabase with Auth0 ID tokens"
```

---

### Task 5: Migrate Bootstrap and Role APIs to Auth0 Claims

**Files:**
- Replace: `src/app/api/onboarding/bootstrap/route.ts`
- Modify: `src/app/api/onboarding/investor/route.ts`
- Modify: `src/app/api/onboarding/founder/route.ts`

**Interfaces:**
- Consumes: `auth0.getSession()`, `createClient()`, `bootstrapOnboardingIdentity`, `requireRole`
- Produces bootstrap response: `{ ok, profileId, role, auth: { sub, email, emailVerified, name, organizationId } }`
- Produces role GET response: normalized `{ auth: { email, emailVerified } }`

- [ ] **Step 1: Replace the bootstrap endpoint**

Require `auth0.getSession()` before parsing the body. Validate the role with `publicSignupRole`, create the authenticated Supabase client, call `bootstrapOnboardingIdentity`, log RPC failures, and return:

```ts
return NextResponse.json({
  ok: true,
  profileId: result.profileId,
  role,
  auth: {
    sub: session.user.sub,
    email: session.user.email ?? null,
    emailVerified: session.user.email_verified === true,
    name: session.user.name ?? null,
    organizationId: session.user.org_id ?? null,
  },
});
```

Use `401` for no session, `400` for an invalid role, and `500` for RPC failure.

- [ ] **Step 2: Patch only the Investor GET handler**

Destructure `auth0User` instead of `user`, compute email and verification state with profile fallbacks, and return both `auth` and the existing `user`, `profile`, `investor`, `progress`, and `agreements` keys:

```ts
const email = auth0User.email ?? profile.data?.email ?? null;
const emailVerified =
  auth0User.email_verified === true || profile.data?.email_verified === true;
```

Do not alter Investor `PATCH`.

- [ ] **Step 3: Patch only the Founder GET handler**

Destructure `auth0User` and add:

```ts
auth: {
  email: auth0User.email ?? profile.data?.email ?? null,
  emailVerified:
    auth0User.email_verified === true ||
    profile.data?.email_verified === true,
},
```

to the existing founder GET response. Do not alter Founder `PATCH`, `primary_founder_user_id`, or the document route.

- [ ] **Step 4: Verify persistence-only regions did not change**

Run: `git diff -- src/app/api/onboarding/investor/route.ts src/app/api/onboarding/founder/route.ts`

Expected: changes occur only inside `GET()`.

- [ ] **Step 5: Run typecheck and unit tests**

Run: `npm run typecheck`

Run: `npm test`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/onboarding/bootstrap/route.ts src/app/api/onboarding/investor/route.ts src/app/api/onboarding/founder/route.ts
git commit -m "feat: expose Auth0 onboarding identity"
```

---

### Task 6: Replace Account and Security Screens with Auth0 UI

**Files:**
- Create: `src/components/onboarding/auth/AuthAccountStep.tsx`
- Create: `src/components/onboarding/auth/AuthSecurityStep.tsx`
- Modify: `src/components/onboarding/OnboardingController.tsx`

**Interfaces:**
- Consumes: authorization helpers from `auth-links.ts`
- Produces: `AuthAccountStep` controlled account gateway
- Produces: `AuthSecurityState = { email: string | null; emailVerified: boolean }`
- Produces: `AuthSecurityStep` with Auth0 passkey enrollment and MFA reauthentication link

- [ ] **Step 1: Create the controlled Account gateway**

Implement the props and markup from `Kori-auth.md` section 29. Keep role, Google, LinkedIn, email, country, terms, and newsletter controls. Replace the password field with this notice:

```tsx
<div className="notice">
  <b>Password secured by Auth0</b>
  <p>
    Continue to Auth0 to create your password and verify your email with the
    one-time code.
  </p>
</div>
```

- [ ] **Step 2: Create the Security step**

Import `passkey` and `serializeCredential` from `@auth0/nextjs-auth0/client`. Implement `addPasskey()` as:

```ts
const challenge = await passkey.enrollmentChallenge();
const publicKey = PublicKeyCredential.parseCreationOptionsFromJSON(
  challenge.authnParamsPublicKey,
);
const credential = await navigator.credentials.create({ publicKey });
if (!(credential instanceof PublicKeyCredential)) {
  throw new Error("Passkey creation was cancelled.");
}
await passkey.enrollmentVerify({
  authenticationMethodId: challenge.authenticationMethodId,
  authSession: challenge.authSession,
  authResponse: serializeCredential(credential),
});
```

Guard unsupported browsers, disable enrollment until email is verified, announce results through `role="status"`, and use `securityReauthUrl(role)` for the Authenticator App link. Describe SMS as Auth0-managed without storing any factor secrets.

- [ ] **Step 3: Replace the controller authentication state and actions**

Remove the Supabase client import, `securityVerified`, `bootstrap`, `account`, `oauth`, and `verifyCode`. Add:

```ts
const [authState, setAuthState] = useState<AuthSecurityState>({
  email: null,
  emailVerified: false,
});
```

Add `savePreAuthState`, `beginAuth`, and `beginEmailSignup` exactly around the session-storage key:

```text
kori:onboarding:${role}:preauth
```

Require terms before redirect, require a non-empty email for email signup, and redirect with `window.location.assign(href)`.

- [ ] **Step 4: Replace the controller load flow**

Restore the four pre-auth fields from `sessionStorage`. When `auth=complete`, POST `{ role }` to `/api/onboarding/bootstrap`, set `authState` from its response, and remove the query with:

```ts
window.history.replaceState({}, "", `/onboarding/${role}`);
```

Then GET `/api/onboarding/${role}`. Treat `401` as a new visitor, surface other response errors, set `authState`, and preserve the current profile/startup/investor/progress hydration logic.

- [ ] **Step 5: Replace only steps 0 and 1**

Render controlled `AuthAccountStep` for step 0 and `AuthSecurityStep` for step 1. In `save()`, step 0 starts email signup and step 1 blocks forward navigation unless `authState.emailVerified` is true. Preserve exact step 2-5 markup and `payload()` logic.

- [ ] **Step 6: Prove local password and OTP handling is gone**

Run: `rg -n 'draft\.password|draft\.otp|signUp\(|signInWithOAuth|verifyOtp|supabase\.auth' src/components/onboarding src/lib/onboarding`

Expected: no matches.

- [ ] **Step 7: Run lint and typecheck**

Run: `npm run lint`

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/onboarding/auth/AuthAccountStep.tsx src/components/onboarding/auth/AuthSecurityStep.tsx src/components/onboarding/OnboardingController.tsx
git commit -m "feat: move onboarding authentication to Auth0"
```

---

### Task 7: Resolve the Profile Page Through the Kori Identity Mapping

**Files:**
- Replace: `src/app/profile/page.tsx`

**Interfaces:**
- Consumes: `auth0.getSession()`, authenticated `createClient()`, and `current_profile_id()`
- Preserves: `ProfileView` props and investor/founder/admin role priority

- [ ] **Step 1: Replace Supabase Auth lookup with Auth0 session lookup**

Use:

```ts
const session = await auth0.getSession();
if (!session) redirect("/auth/login?returnTo=/profile");
```

Create the Supabase client, call `current_profile_id()`, redirect missing mappings to `/join`, and load `profiles` by the returned Kori UUID.

- [ ] **Step 2: Preserve role and completion routing with the Kori UUID**

Keep the requested role validation and priority `investor`, then `founder`, then `admin`. Set:

```ts
const userId = profileResult.data.id;
```

Use `userId` for investor/founder completion checks and `startups.primary_founder_user_id`. Preserve the existing `ProfileView` rendering.

- [ ] **Step 3: Verify no Supabase Auth lookup remains**

Run: `rg -n 'supabase\.auth|auth\.user\.id|hasSupabaseConfig' src/app/profile/page.tsx`

Expected: no matches.

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/profile/page.tsx
git commit -m "feat: map Auth0 sessions to Kori profiles"
```

---

### Task 8: Record the Auth0 Identity and RLS Migration

**Files:**
- Create: `supabase/migrations/004_auth0_identity.sql`
- Potentially modify: `package.json`
- Potentially modify: `package-lock.json`

**Interfaces:**
- Produces database RPC: `current_profile_id() RETURNS uuid`
- Produces database RPC: `bootstrap_kori_identity(p_role text) RETURNS uuid`
- Produces RLS policies based on Kori UUID mapping for onboarding and both Storage buckets

- [ ] **Step 1: Copy the supplied migration byte-for-byte**

Source: `/Users/whererubeen/Downloads/Kori-auth-supabase.sql`

Destination: `supabase/migrations/004_auth0_identity.sql`

Use `apply_patch` for the repository write. Do not edit SQL semantics during the copy.

- [ ] **Step 2: Verify source and destination are identical**

Run: `cmp /Users/whererubeen/Downloads/Kori-auth-supabase.sql supabase/migrations/004_auth0_identity.sql`

Expected: exit code 0 and no output.

- [ ] **Step 3: Statistically verify the security invariants**

Run: `rg -n 'current_profile_id|bootstrap_kori_identity|profile-photos|startup-data-room' supabase/migrations/004_auth0_identity.sql`

Expected: both RPCs and both Storage bucket policy groups are present.

Run: `rg -n 'auth\.uid\(\)' supabase/migrations/004_auth0_identity.sql`

Expected: no executable policy expression uses `auth.uid()`; explanatory comments, if present, are acceptable only when confirmed manually.

- [ ] **Step 4: Remove `@supabase/ssr` only if it is unused**

Run: `rg -n '@supabase/ssr' --glob '!package-lock.json' --glob '!package.json' .`

If there are no imports, run: `npm uninstall @supabase/ssr`

Confirm `@supabase/supabase-js` remains installed.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/004_auth0_identity.sql package.json package-lock.json
git commit -m "feat: add Auth0 identity RLS migration"
```

---

### Task 9: Run Cutover Verification and Document External Gates

**Files:**
- Modify only files required to fix failures caused by Tasks 1-8

**Interfaces:**
- Verifies the complete local repository cutover
- Reports live Auth0/Supabase/deployment checks as operator work, not local successes

- [ ] **Step 1: Run the targeted unit tests**

Run: `node --experimental-strip-types --test src/lib/onboarding/auth-links.test.ts src/lib/onboarding/bootstrap.test.ts src/lib/onboarding/contracts.test.ts`

Expected: PASS.

- [ ] **Step 2: Run the complete test suite**

Run: `npm test`

Expected: PASS.

- [ ] **Step 3: Run static quality checks**

Run: `npm run lint`

Run: `npm run typecheck`

Expected: both PASS.

- [ ] **Step 4: Run the production build**

Run: `npm run build`

Expected: PASS without duplicate proxy/callback errors or missing Auth0 modules.

- [ ] **Step 5: Verify the old identity boundary is absent**

Run: `rg -n '@supabase/ssr|supabase\.auth|exchangeCodeForSession|refreshSession|auth\.uid\(\)' src proxy.ts 2>/dev/null`

Expected: no matches and no root `proxy.ts`.

Run: `git diff --check`

Expected: PASS.

- [ ] **Step 6: Review the final diff against scope**

Run: `git status --short`

Run: `git diff HEAD~8 --stat`

Confirm that investor/founder persistence, validation schemas, shared SelectField/Completion components, marketing CTA pages, and founder document business logic were not rewritten.

- [ ] **Step 7: Commit verification-only fixes if any**

```bash
git add <only the files changed to resolve verified failures>
git commit -m "fix: complete Auth0 cutover verification"
```

Skip this commit if verification required no code changes.

- [ ] **Step 8: Report external completion gates**

The handoff must state that these remain unverified locally: live SQL execution and post-migration checks, Auth0 application/connections/Post Login Action, Supabase Third-Party Auth, environment secrets, email OTP, Google, LinkedIn, passkey, enabled MFA factors, two-user RLS isolation, and Vercel Preview acceptance testing.
