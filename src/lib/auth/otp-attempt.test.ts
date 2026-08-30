import assert from "node:assert/strict";
import test from "node:test";

import { shouldAttemptEmailOtp } from "./otp-attempt.ts";

test("an unchanged rejected OTP is not attempted again when busy clears", () => {
  const attempt = {
    otp: "123456",
    otpRequired: true,
    emailVerified: false,
    busy: false,
  };

  assert.equal(
    shouldAttemptEmailOtp({ ...attempt, lastAttemptedOtp: "" }),
    true,
  );
  assert.equal(
    shouldAttemptEmailOtp({
      ...attempt,
      lastAttemptedOtp: "123456",
    }),
    false,
  );
});

test("OTP attempts wait for a complete eligible verification state", () => {
  const base = {
    otp: "123456",
    otpRequired: true,
    emailVerified: false,
    busy: false,
    lastAttemptedOtp: "",
  };

  assert.equal(shouldAttemptEmailOtp({ ...base, otp: "12345" }), false);
  assert.equal(shouldAttemptEmailOtp({ ...base, busy: true }), false);
  assert.equal(
    shouldAttemptEmailOtp({ ...base, emailVerified: true }),
    false,
  );
  assert.equal(
    shouldAttemptEmailOtp({ ...base, otpRequired: false }),
    false,
  );
});
