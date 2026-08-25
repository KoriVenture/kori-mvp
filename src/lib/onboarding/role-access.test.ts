import assert from "node:assert/strict";
import test from "node:test";

import {
  authorizeProfileRole,
  resolveCurrentProfileId,
} from "./role-access.ts";

test("profile mapping failures require onboarding bootstrap", () => {
  assert.deepEqual(
    resolveCurrentProfileId({
      data: null,
      error: { message: "mapping failed" },
    }),
    {
      ok: false,
      status: 409,
      error: "Kori profile does not exist. Bootstrap onboarding first.",
    },
  );

  assert.deepEqual(
    resolveCurrentProfileId({ data: "not-a-uuid", error: null }),
    {
      ok: false,
      status: 409,
      error: "Kori profile does not exist. Bootstrap onboarding first.",
    },
  );
});

test("profile read failures produce an internal error", () => {
  assert.deepEqual(
    authorizeProfileRole("investor", {
      data: null,
      error: { message: "read failed" },
    }),
    {
      ok: false,
      status: 500,
      error: "Unable to read Kori profile.",
    },
  );
});

test("a missing business role is forbidden", () => {
  assert.deepEqual(
    authorizeProfileRole("founder", {
      data: {
        id: "3fda0d51-35f9-4ccc-89dd-3a0000000001",
        roles: ["investor"],
        verification_status: "deferred",
        email: "investor@example.com",
        email_verified: true,
        auth0_user_id: "auth0|123",
      },
      error: null,
    }),
    {
      ok: false,
      status: 403,
      error: "Role not permitted.",
    },
  );
});

test("an authorized business role returns the Kori profile", () => {
  const profile = {
    id: "3fda0d51-35f9-4ccc-89dd-3a0000000001",
    roles: ["investor", "founder"],
    verification_status: "deferred",
    email: "founder@example.com",
    email_verified: true,
    auth0_user_id: "auth0|123",
  };

  assert.deepEqual(authorizeProfileRole("founder", { data: profile, error: null }), {
    ok: true,
    profile,
  });
});
