import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { mock, test } from "node:test";

const srcRoot = new URL("../../", import.meta.url);

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return {
        url: new URL(`${specifier.slice(2)}.ts`, srcRoot).href,
        shortCircuit: true,
      };
    }
    return nextResolve(specifier, context);
  },
});

type Call = Record<string, unknown>;

let passkeyCalls = 0;
let enrollCall: Call | undefined;
let challengeCall: Call | undefined;
let challengeAndVerifyCall: Call | undefined;
let verifyCall: Call | undefined;
let unenrollCall: Call | undefined;
let phoneChallengeShouldFail = false;

const client = {
  auth: {
    async registerPasskey() {
      passkeyCalls += 1;
      return { data: { credential: "passkey" }, error: null };
    },
    mfa: {
      async enroll(input: Call) {
        enrollCall = input;
        if (input.factorType === "phone") {
          return { data: { id: "phone-factor" }, error: null };
        }
        return {
          data: {
            id: "totp-factor",
            totp: {
              qr_code: "data:image/svg+xml;base64,qr",
              secret: "TOTPSECRET",
              uri: "otpauth://totp/Kori",
            },
          },
          error: null,
        };
      },
      async challenge(input: Call) {
        challengeCall = input;
        if (phoneChallengeShouldFail) {
          return {
            data: null,
            error: new Error("challenge failed"),
          };
        }
        return { data: { id: "phone-challenge" }, error: null };
      },
      async challengeAndVerify(input: Call) {
        challengeAndVerifyCall = input;
        return { data: { access_token: "aal2" }, error: null };
      },
      async verify(input: Call) {
        verifyCall = input;
        return { data: { access_token: "aal2" }, error: null };
      },
      async unenroll(input: Call) {
        unenrollCall = input;
        return { data: {}, error: null };
      },
    },
  },
};

mock.module(new URL("../supabase/client.ts", import.meta.url), {
  namedExports: {
    createClient() {
      return client;
    },
  },
});

async function securityModule() {
  return import("./security.ts").catch(() => null);
}

test("passkey registration is feature-gated and real when enabled", async () => {
  const security = await securityModule();
  assert.ok(security, "security module must exist");

  process.env.NEXT_PUBLIC_ENABLE_PASSKEYS = "false";
  await assert.rejects(
    security.registerKoriPasskey(),
    /Passkeys are not enabled/,
  );
  assert.equal(passkeyCalls, 0);

  process.env.NEXT_PUBLIC_ENABLE_PASSKEYS = "true";
  await security.registerKoriPasskey();
  assert.equal(passkeyCalls, 1);
});

test("TOTP enrollment returns setup data and verifies a cleaned code", async () => {
  const security = await securityModule();
  assert.ok(security, "security module must exist");

  const enrollment = await security.beginTotpEnrollment();
  assert.deepEqual(enrollment, {
    factorId: "totp-factor",
    qrCode: "data:image/svg+xml;base64,qr",
    secret: "TOTPSECRET",
    uri: "otpauth://totp/Kori",
  });
  assert.deepEqual(enrollCall, { factorType: "totp" });

  await security.verifyTotpEnrollment({
    factorId: "totp-factor",
    code: "12a34-56",
  });
  assert.deepEqual(challengeAndVerifyCall, {
    factorId: "totp-factor",
    code: "123456",
  });
});

test("phone MFA is blocked on Free and uses real enrollment when enabled", async () => {
  const security = await securityModule();
  assert.ok(security, "security module must exist");

  process.env.NEXT_PUBLIC_ENABLE_PHONE_MFA = "false";
  await assert.rejects(
    security.beginPhoneEnrollment("+15145550123"),
    /not available on the current Supabase Free plan/,
  );

  process.env.NEXT_PUBLIC_ENABLE_PHONE_MFA = "true";
  const enrollment = await security.beginPhoneEnrollment(
    "  +15145550123  ",
  );
  assert.deepEqual(enrollment, {
    factorId: "phone-factor",
    challengeId: "phone-challenge",
    phone: "+15145550123",
  });
  assert.deepEqual(enrollCall, {
    factorType: "phone",
    phone: "+15145550123",
  });
  assert.deepEqual(challengeCall, { factorId: "phone-factor" });

  await security.verifyPhoneEnrollment({
    factorId: "phone-factor",
    challengeId: "phone-challenge",
    code: "1 2-3456",
  });
  assert.deepEqual(verifyCall, {
    factorId: "phone-factor",
    challengeId: "phone-challenge",
    code: "123456",
  });

  await security.cancelMfaEnrollment("phone-factor");
  assert.deepEqual(unenrollCall, { factorId: "phone-factor" });
});

test("failed phone challenges clean up the newly enrolled factor", async () => {
  const security = await securityModule();
  assert.ok(security, "security module must exist");

  process.env.NEXT_PUBLIC_ENABLE_PHONE_MFA = "true";
  phoneChallengeShouldFail = true;
  unenrollCall = undefined;

  await assert.rejects(
    security.beginPhoneEnrollment("+15145550123"),
    /challenge failed/,
  );
  assert.deepEqual(unenrollCall, { factorId: "phone-factor" });

  phoneChallengeShouldFail = false;
});
