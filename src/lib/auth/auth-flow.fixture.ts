import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { mock, test } from "node:test";

const srcRoot = new URL("../../", import.meta.url);

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/server") {
      return nextResolve("next/server.js", context);
    }
    if (specifier.startsWith("@/")) {
      return {
        url: new URL(`${specifier.slice(2)}.ts`, srcRoot).href,
        shortCircuit: true,
      };
    }
    return nextResolve(specifier, context);
  },
});

type CapturedCall = Record<string, unknown>;

let signupCall: CapturedCall | undefined;
let oauthCall: CapturedCall | undefined;
let verifyCall: CapturedCall | undefined;
let resendCall: CapturedCall | undefined;
let passwordSignInCall: CapturedCall | undefined;

const browserClient = {
  auth: {
    async signUp(input: CapturedCall) {
      signupCall = input;
      return { data: { user: null, session: null }, error: null };
    },
    async signInWithOAuth(input: CapturedCall) {
      oauthCall = input;
      return { data: { provider: input.provider }, error: null };
    },
    async verifyOtp(input: CapturedCall) {
      verifyCall = input;
      return { data: { user: null, session: null }, error: null };
    },
    async resend(input: CapturedCall) {
      resendCall = input;
      return { data: { messageId: "message-123" }, error: null };
    },
    async signInWithPassword(input: CapturedCall) {
      passwordSignInCall = input;
      return { data: { user: { id: "user-123" }, session: {} }, error: null };
    },
  },
};

let authenticatedUser: Record<string, unknown> | null = {
  id: "user-123",
  email: "investor@example.com",
  email_confirmed_at: "2026-08-28T12:00:00.000Z",
};
let exchangedCode: string | undefined;
const agreementWrites: Array<{
  values: Array<Record<string, unknown>>;
  options: Record<string, unknown>;
}> = [];

const serverClient = {
  auth: {
    async getUser() {
      return {
        data: { user: authenticatedUser },
        error: authenticatedUser ? null : new Error("unauthenticated"),
      };
    },
    async exchangeCodeForSession(code: string) {
      exchangedCode = code;
      return { data: {}, error: null };
    },
  },
  from(table: string) {
    assert.equal(table, "agreement_acceptances");
    return {
      async upsert(
        values: Array<Record<string, unknown>>,
        options: Record<string, unknown>,
      ) {
        agreementWrites.push({ values, options });
        return { error: null };
      },
    };
  },
};

const bootstrapCalls: Array<Record<string, unknown>> = [];

mock.module(new URL("../supabase/client.ts", import.meta.url), {
  namedExports: {
    createClient() {
      return browserClient;
    },
  },
});

mock.module(new URL("../supabase/server.ts", import.meta.url), {
  namedExports: {
    async createClient() {
      return serverClient;
    },
  },
});

mock.module(new URL("../onboarding/bootstrap.ts", import.meta.url), {
  namedExports: {
    async bootstrapOnboardingIdentity(input: Record<string, unknown>) {
      bootstrapCalls.push(input);
      return "user-123";
    },
  },
});

Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: { location: { origin: "https://kori.example" } },
});

const account = await import("./account.ts");
const interactiveAccount = account as typeof account & {
  signInEmailPassword?: (input: {
    email: string;
    password: string;
  }) => Promise<unknown>;
  startSocialSignIn?: (
    provider: "google" | "linkedin_oidc",
  ) => Promise<unknown>;
};
const bootstrapRoute = await import(
  "../../app/api/onboarding/bootstrap/route.ts"
);
const callbackRoute = await import("../../app/auth/callback/route.ts");

test("account helpers send normalized email signup, OTP, and resend payloads", async () => {
  await account.createEmailPasswordAccount({
    email: "  Investor@Example.COM ",
    password: "correct-horse-battery-staple",
    role: "investor",
  });
  await account.verifyEmailAccountOtp({
    email: "  Investor@Example.COM ",
    token: " 123456 ",
  });
  await account.resendEmailAccountOtp("  Investor@Example.COM ");

  assert.deepEqual(signupCall, {
    email: "investor@example.com",
    password: "correct-horse-battery-staple",
    options: { data: { onboarding_role: "investor" } },
  });
  assert.deepEqual(verifyCall, {
    email: "investor@example.com",
    token: "123456",
    type: "email",
  });
  assert.deepEqual(resendCall, {
    type: "signup",
    email: "investor@example.com",
  });
});

test("social account creation uses the exact provider and allowlisted callback", async () => {
  await account.startSocialAccountCreation({
    provider: "google",
    next: "/onboarding/investor",
  });
  assert.deepEqual(oauthCall, {
    provider: "google",
    options: {
      redirectTo:
        "https://kori.example/auth/callback?next=%2Fonboarding%2Finvestor",
    },
  });

  await account.startSocialAccountCreation({
    provider: "linkedin_oidc",
    next: "/onboarding/founder",
  });
  assert.deepEqual(oauthCall, {
    provider: "linkedin_oidc",
    options: {
      redirectTo:
        "https://kori.example/auth/callback?next=%2Fonboarding%2Ffounder",
    },
  });
});

test("existing users can sign in with password or social providers", async () => {
  assert.equal(typeof interactiveAccount.signInEmailPassword, "function");
  assert.equal(typeof interactiveAccount.startSocialSignIn, "function");

  await interactiveAccount.signInEmailPassword?.({
    email: " Existing@Example.COM ",
    password: "existing-password",
  });
  assert.deepEqual(passwordSignInCall, {
    email: "existing@example.com",
    password: "existing-password",
  });

  await interactiveAccount.startSocialSignIn?.("linkedin_oidc");
  assert.deepEqual(oauthCall, {
    provider: "linkedin_oidc",
    options: {
      redirectTo: "https://kori.example/auth/callback?next=%2Fprofile",
    },
  });
});

test("bootstrap writes agreements only after explicit first-screen acceptance", async () => {
  agreementWrites.length = 0;
  bootstrapCalls.length = 0;

  const withoutTerms = await bootstrapRoute.POST(
    new Request("https://kori.example/api/onboarding/bootstrap", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        role: "investor",
        country: "",
        termsAccepted: false,
        newsletter: false,
      }),
    }),
  );

  assert.equal(withoutTerms.status, 200);
  assert.equal(agreementWrites.length, 0);
  assert.equal(bootstrapCalls.length, 1);

  const withTerms = await bootstrapRoute.POST(
    new Request("https://kori.example/api/onboarding/bootstrap", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        role: "founder",
        country: "Nigeria",
        termsAccepted: true,
        newsletter: true,
      }),
    }),
  );

  assert.equal(withTerms.status, 200);
  assert.equal(agreementWrites.length, 1);
  assert.deepEqual(
    agreementWrites[0]?.values.map((value) => value.agreement_type),
    ["terms", "privacy"],
  );
  assert.equal(
    agreementWrites[0]?.values.every((value) => value.accepted === true),
    true,
  );
});

test("bootstrap rejects unauthenticated requests before identity writes", async () => {
  authenticatedUser = null;
  const initialCalls = bootstrapCalls.length;

  try {
    const response = await bootstrapRoute.POST(
      new Request("https://kori.example/api/onboarding/bootstrap", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "investor" }),
      }),
    );

    assert.equal(response.status, 401);
    assert.equal(bootstrapCalls.length, initialCalls);
  } finally {
    authenticatedUser = {
      id: "user-123",
      email: "investor@example.com",
      email_confirmed_at: "2026-08-28T12:00:00.000Z",
    };
  }
});

test("OAuth callback exchanges a PKCE code and rejects provider errors", async () => {
  exchangedCode = undefined;
  const providerError = await callbackRoute.GET(
    new Request(
      "https://kori.example/auth/callback?next=/onboarding/investor&error=access_denied&code=ignored",
    ),
  );
  assert.equal(providerError.status, 307);
  assert.equal(
    providerError.headers.get("location"),
    "https://kori.example/onboarding/investor?auth=error",
  );
  assert.equal(exchangedCode, undefined);

  const completed = await callbackRoute.GET(
    new Request(
      "https://kori.example/auth/callback?next=/onboarding/founder&code=pkce-code",
    ),
  );
  assert.equal(completed.status, 307);
  assert.equal(exchangedCode, "pkce-code");
  assert.equal(
    completed.headers.get("location"),
    "https://kori.example/onboarding/founder?auth=complete",
  );
});
