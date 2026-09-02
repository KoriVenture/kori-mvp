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

let profileError: Error | null = null;
let storageError: Error | null = null;
let updateError: Error | null = null;
let removeCalls = 0;
let updateCalls = 0;

const supabase = {
  from(table: string) {
    assert.equal(table, "profiles");
    return {
      select() {
        return {
          eq() {
            return {
              async single() {
                return {
                  data: profileError
                    ? null
                    : { photo_path: "user-123/avatar.jpg" },
                  error: profileError,
                };
              },
            };
          },
        };
      },
      update() {
        return {
          async eq() {
            updateCalls += 1;
            return { error: updateError };
          },
        };
      },
    };
  },
  storage: {
    from(bucket: string) {
      assert.equal(bucket, "profile-photos");
      return {
        async remove(paths: string[]) {
          removeCalls += 1;
          assert.deepEqual(paths, ["user-123/avatar.jpg"]);
          return { error: storageError };
        },
      };
    },
  },
};

mock.module(new URL("../onboarding/http.ts", import.meta.url), {
  namedExports: {
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
  "../../app/api/onboarding/investor/photo/route.ts"
);

function reset() {
  profileError = null;
  storageError = null;
  updateError = null;
  removeCalls = 0;
  updateCalls = 0;
}

test("photo deletion reports every Supabase failure and succeeds cleanly", async () => {
  reset();
  profileError = new Error("profile read failed");
  let response = await route.DELETE();
  assert.equal(response.status, 500);
  assert.equal(removeCalls, 0);
  assert.equal(updateCalls, 0);

  reset();
  storageError = new Error("storage delete failed");
  response = await route.DELETE();
  assert.equal(response.status, 500);
  assert.equal(removeCalls, 1);
  assert.equal(updateCalls, 0);

  reset();
  updateError = new Error("profile update failed");
  response = await route.DELETE();
  assert.equal(response.status, 500);
  assert.equal(removeCalls, 1);
  assert.equal(updateCalls, 1);

  reset();
  response = await route.DELETE();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(removeCalls, 1);
  assert.equal(updateCalls, 1);
});
