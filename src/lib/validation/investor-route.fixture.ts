import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { mock, test } from "node:test";

const srcRoot = new URL("../../", import.meta.url);

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/server") {
      return nextResolve("next/server.js", context);
    }
    if (
      specifier === "../onboarding/contracts" &&
      context.parentURL?.endsWith("/validation/investor-onboarding.ts")
    ) {
      return nextResolve("../onboarding/contracts.ts", context);
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

const writes: Array<{
  table: string;
  operation: "update" | "upsert";
  values: Record<string, unknown>;
}> = [];

function writeQuery(
  table: string,
  operation: "update" | "upsert",
  values: Record<string, unknown>,
) {
  return {
    eq() {
      return this;
    },
    select() {
      return this;
    },
    async single() {
      writes.push({ table, operation, values });
      return {
        data: { user_id: "user-123", id: "user-123" },
        error: null,
      };
    },
  };
}

const supabase = {
  from(table: string) {
    return {
      update(values: Record<string, unknown>) {
        return writeQuery(table, "update", values);
      },
      upsert(values: Record<string, unknown>) {
        return writeQuery(table, "upsert", values);
      },
    };
  },
};

mock.module(new URL("../onboarding/http.ts", import.meta.url), {
  namedExports: {
    invalid(details: unknown) {
      return Response.json(
        { error: "Invalid request.", details },
        { status: 400 },
      );
    },
    async requireRole() {
      return {
        error: null,
        supabase,
        userId: "user-123",
        user: { id: "user-123" },
      };
    },
  },
});

const route = await import(
  "../../app/api/onboarding/investor/route.ts"
);

const partialEligibility = {
  investorClassification: "",
  investmentExperience: "",
  privateCompanyExperience: "",
  sourceOfFunds: "",
  riskAcknowledged: false,
};

const completeEligibility = {
  investorClassification: "Accredited investor",
  investmentExperience: "5+ years",
  privateCompanyExperience: "Yes",
  sourceOfFunds: "Employment income",
  riskAcknowledged: true,
};

const completeAgreements = {
  terms: true,
  privacy: true,
  platform: true,
  risk: true,
  signatureName: "Ada Investor",
  signedAt: "2026-08-31T12:00:00.000Z",
};

test("screen 4 persists a partial eligibility draft", async () => {
  writes.length = 0;
  const response = await route.PATCH(
    new Request("https://kori.example/api/onboarding/investor", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        screen: 4,
        eligibility: partialEligibility,
      }),
    }),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(
    writes.map((write) => write.table),
    ["investor_profiles", "onboarding_progress"],
  );
});

test("screen 5 rejects an incomplete eligibility draft before writes", async () => {
  writes.length = 0;
  const response = await route.PATCH(
    new Request("https://kori.example/api/onboarding/investor", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        screen: 5,
        eligibility: partialEligibility,
      }),
    }),
  );

  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(
    body.error,
    "Complete all required eligibility fields and acknowledge the risk disclosure before continuing.",
  );
  assert.ok(body.details);
  assert.deepEqual(writes, []);
});

test("screen 5 does not require eligibility to be resent", async () => {
  writes.length = 0;
  const response = await route.PATCH(
    new Request("https://kori.example/api/onboarding/investor", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ screen: 5 }),
    }),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(
    writes.map((write) => write.table),
    ["onboarding_progress"],
  );
});

test("screen 5 validates eligibility before unrelated writes", async () => {
  writes.length = 0;
  const response = await route.PATCH(
    new Request("https://kori.example/api/onboarding/investor", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        screen: 5,
        profile: {},
        preferences: {},
        eligibility: partialEligibility,
      }),
    }),
  );

  assert.equal(response.status, 400);
  assert.deepEqual(writes, []);
});

test("completion requires agreements without resending eligibility", async () => {
  writes.length = 0;
  const withoutAgreements = await route.PATCH(
    new Request("https://kori.example/api/onboarding/investor", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        screen: 6,
        complete: true,
      }),
    }),
  );

  assert.equal(withoutAgreements.status, 400);
  assert.equal(writes.length, 0);

  const valid = await route.PATCH(
    new Request("https://kori.example/api/onboarding/investor", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        screen: 6,
        complete: true,
        agreements: completeAgreements,
      }),
    }),
  );

  assert.equal(valid.status, 200);
  assert.deepEqual(await valid.json(), {
    ok: true,
    screen: 6,
  });
  assert.equal(
    writes.some(
      (write) =>
        write.table === "investor_profiles" &&
        write.values.onboarding_status === "completed",
    ),
    true,
  );
});

test("screen 6 is reachable only through a valid completion request", async () => {
  writes.length = 0;
  const withoutCompletion = await route.PATCH(
    new Request("https://kori.example/api/onboarding/investor", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        screen: 6,
        eligibility: completeEligibility,
      }),
    }),
  );

  assert.equal(withoutCompletion.status, 400);
  assert.equal(writes.length, 0);

  const wrongScreen = await route.PATCH(
    new Request("https://kori.example/api/onboarding/investor", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        screen: 5,
        complete: true,
        eligibility: completeEligibility,
        agreements: completeAgreements,
      }),
    }),
  );

  assert.equal(wrongScreen.status, 400);
  assert.equal(writes.length, 0);
});
