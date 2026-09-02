type EmailOtpAttemptState = {
  otp: string;
  otpRequired: boolean;
  emailVerified: boolean;
  busy: boolean;
  lastAttemptedOtp: string;
};

export function shouldAttemptEmailOtp(
  state: EmailOtpAttemptState,
) {
  return (
    state.otpRequired &&
    /^\d{6}$/.test(state.otp) &&
    !state.emailVerified &&
    !state.busy &&
    state.otp !== state.lastAttemptedOtp
  );
}
