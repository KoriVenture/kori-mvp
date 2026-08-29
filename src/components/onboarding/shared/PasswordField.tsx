"use client";

import { useState } from "react";

export function PasswordField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="ko-field">
      <span>Create password</span>
      <span className="ko-password-wrap">
        <input
          type={visible ? "text" : "password"}
          value={value}
          minLength={8}
          autoComplete="new-password"
          required
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="ko-icon-button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((current) => !current)}
        >
          <img src="/assets/onboarding/shared/eye-off.svg" alt="" />
        </button>
      </span>
      <small>Min. 8 characters with numbers, symbols & capitals.</small>
    </label>
  );
}
