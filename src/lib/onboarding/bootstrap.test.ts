import assert from "node:assert/strict";
import test from "node:test";

type Insert = {
  table: string;
  values: Record<string, unknown>;
};

function onboardingClient() {
  const inserts: Insert[] = [];

  return {
    inserts,
    client: {
      from(table: string) {
        const query = {
          select() {
            return query;
          },
          eq() {
            return query;
          },
          maybeSingle() {
            return Promise.resolve({ data: null, error: null });
          },
          insert(values: Record<string, unknown>) {
            inserts.push({ table, values });
            return Promise.resolve({ error: null });
          },
        };

        return query;
      },
    },
  };
}

test("bootstrap creates the Kori investor records for an authenticated user", async () => {
  const modulePath = "./bootstrap.ts";
  const bootstrapModule = await import(modulePath).catch(() => null);

  assert.ok(bootstrapModule, "onboarding bootstrap module should exist");

  const { client, inserts } = onboardingClient();
  const result = await bootstrapModule.bootstrapOnboardingUser(
    client,
    { id: "user-123" },
    "investor",
    1,
  );

  assert.deepEqual(result, { ok: true });
  assert.deepEqual(inserts, [
    {
      table: "profiles",
      values: {
        id: "user-123",
        roles: ["investor"],
        verification_status: "deferred",
      },
    },
    {
      table: "investor_profiles",
      values: {
        user_id: "user-123",
        onboarding_status: "in_progress",
      },
    },
    {
      table: "onboarding_progress",
      values: {
        user_id: "user-123",
        role: "investor",
        current_screen: 1,
        completed_screens: [0],
        last_saved_at: inserts[2]?.values.last_saved_at,
      },
    },
  ]);
  assert.match(String(inserts[2]?.values.last_saved_at), /^\d{4}-\d{2}-\d{2}T/);
});
