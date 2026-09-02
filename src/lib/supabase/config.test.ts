import assert from "node:assert/strict";
import test from "node:test";

import {
  hasSupabaseConfig,
  supabaseConfig,
} from "./config.ts";

const ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_ENABLE_PHONE_MFA",
  `NEXT_${"SUPABASE_URL"}`,
  `NEXT_${"SUPABASE_PUBLISHABLE_KEY"}`,
] as const;

const SERVER_ONLY_URL = ENV_KEYS[3];
const SERVER_ONLY_KEY = ENV_KEYS[4];

function withSupabaseEnv(
  values: Partial<Record<(typeof ENV_KEYS)[number], string>>,
  run: () => void,
) {
  const original = Object.fromEntries(
    ENV_KEYS.map((key) => [key, process.env[key]]),
  );

  try {
    for (const key of ENV_KEYS) {
      const value = values[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    run();
  } finally {
    for (const key of ENV_KEYS) {
      const value = original[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("browser-safe Supabase variables configure the shared client", () => {
  withSupabaseEnv(
    {
      NEXT_PUBLIC_SUPABASE_URL: "https://public-project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_public",
    },
    () => {
      assert.equal(hasSupabaseConfig(), true);
      assert.deepEqual(supabaseConfig(), {
        url: "https://public-project.supabase.co",
        key: "sb_publishable_public",
      });
    },
  );
});

test("server-only variable names cannot silently configure browser auth", () => {
  withSupabaseEnv(
    {
      [SERVER_ONLY_URL]: "https://private-name.supabase.co",
      [SERVER_ONLY_KEY]: "sb_publishable_private_name",
    },
    () => {
      assert.equal(hasSupabaseConfig(), false);
      assert.throws(
        () => supabaseConfig(),
        /Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/,
      );
    },
  );
});

test("phone MFA is enabled only by its explicit public flag", async () => {
  const config = await import("./config.ts") as typeof import("./config.ts") & {
    phoneMfaEnabled?: () => boolean;
  };

  assert.equal(typeof config.phoneMfaEnabled, "function");
  withSupabaseEnv(
    { NEXT_PUBLIC_ENABLE_PHONE_MFA: "false" },
    () => assert.equal(config.phoneMfaEnabled?.(), false),
  );
  withSupabaseEnv(
    { NEXT_PUBLIC_ENABLE_PHONE_MFA: "true" },
    () => assert.equal(config.phoneMfaEnabled?.(), true),
  );
});
