import assert from "node:assert/strict";
import test from "node:test";

import { bootstrapOnboardingIdentity } from "./bootstrap.ts";

type CapturedWrite = {
  table: string;
  values: Record<string, unknown>;
  options: Record<string, unknown> | undefined;
};

function fakeSupabase({
  existingRoles = [],
  readError = null,
}: {
  existingRoles?: string[];
  readError?: Error | null;
} = {}) {
  const writes: CapturedWrite[] = [];

  return {
    writes,
    client: {
      from(table: string) {
        return {
          select() {
            return this;
          },
          eq() {
            return this;
          },
          async maybeSingle() {
            return {
              data: readError ? null : { id: "user-123", roles: existingRoles },
              error: readError,
            };
          },
          async upsert(
            values: Record<string, unknown>,
            options?: Record<string, unknown>,
          ) {
            writes.push({ table, values, options });
            return { error: null };
          },
        };
      },
    },
  };
}

test("bootstrap maps the Supabase user UUID and preserves an existing founder role", async () => {
  const { client, writes } = fakeSupabase({ existingRoles: ["founder"] });

  const profileId = await bootstrapOnboardingIdentity({
    supabase: client as never,
    user: {
      id: "user-123",
      email: "investor@example.com",
      email_confirmed_at: "2026-08-28T12:00:00.000Z",
      user_metadata: { full_name: "Investor Example" },
    } as never,
    role: "investor",
    country: "Canada",
    newsletter: true,
  });

  assert.equal(profileId, "user-123");
  assert.deepEqual(
    writes.map(({ table }) => table),
    ["profiles", "investor_profiles", "onboarding_progress"],
  );
  assert.deepEqual(writes[0]?.values.roles, ["founder", "investor"]);
  assert.equal(writes[0]?.values.id, "user-123");
  assert.equal(writes[0]?.values.email_verified, true);
  assert.equal(writes[0]?.values.verification_status, "deferred");
  assert.equal(writes[0]?.values.marketing_opt_in, true);
  assert.deepEqual(writes[2]?.values.completed_screens, [0]);
});

test("bootstrap creates the founder subtype without creating an investor subtype", async () => {
  const { client, writes } = fakeSupabase();

  await bootstrapOnboardingIdentity({
    supabase: client as never,
    user: {
      id: "user-123",
      email: "founder@example.com",
      email_confirmed_at: null,
      user_metadata: {},
    } as never,
    role: "founder",
    country: "Nigeria",
    newsletter: false,
  });

  assert.deepEqual(
    writes.map(({ table }) => table),
    ["profiles", "founder_profiles", "onboarding_progress"],
  );
  assert.deepEqual(writes[0]?.values.roles, ["founder"]);
  assert.equal(writes[0]?.values.email_verified, false);
  assert.equal(writes[0]?.values.marketing_opt_in_at, null);
});

test("bootstrap stops before writes when the existing profile cannot be read", async () => {
  const readError = new Error("profile read failed");
  const { client, writes } = fakeSupabase({ readError });

  await assert.rejects(
    bootstrapOnboardingIdentity({
      supabase: client as never,
      user: {
        id: "user-123",
        email: "investor@example.com",
        email_confirmed_at: null,
        user_metadata: {},
      } as never,
      role: "investor",
      country: "Canada",
      newsletter: false,
    }),
    readError,
  );
  assert.deepEqual(writes, []);
});
