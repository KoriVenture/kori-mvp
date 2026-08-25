import assert from "node:assert/strict";
import test from "node:test";

import { bootstrapOnboardingIdentity } from "./bootstrap.ts";

test("bootstrap delegates investor identity creation to the database RPC", async () => {
  const calls: unknown[] = [];
  const client = {
    async rpc(
      name: "bootstrap_kori_identity",
      args: { p_role: "investor" | "founder" },
    ) {
      calls.push({ name, args });
      return {
        data: "3fda0d51-35f9-4ccc-89dd-3a0000000001",
        error: null,
      };
    },
  };

  const result = await bootstrapOnboardingIdentity(client, "investor");

  assert.deepEqual(result, {
    ok: true,
    profileId: "3fda0d51-35f9-4ccc-89dd-3a0000000001",
  });
  assert.deepEqual(calls, [
    {
      name: "bootstrap_kori_identity",
      args: { p_role: "investor" },
    },
  ]);
});

test("bootstrap surfaces database RPC errors", async () => {
  const client = {
    async rpc() {
      return {
        data: null,
        error: { message: "Authenticated JWT required." },
      };
    },
  };

  const result = await bootstrapOnboardingIdentity(
    client as never,
    "founder",
  );

  assert.deepEqual(result, {
    ok: false,
    error: "Authenticated JWT required.",
  });
});

test("bootstrap rejects an invalid RPC profile id", async () => {
  for (const data of [null, "", { id: "profile-id" }]) {
    const client = {
      async rpc() {
        return { data, error: null };
      },
    };

    const result = await bootstrapOnboardingIdentity(
      client as never,
      "investor",
    );

    assert.deepEqual(result, {
      ok: false,
      error: "Kori identity bootstrap did not return a profile id.",
    });
  }
});
