"use client";

import { useRef } from "react";

export function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const chars = Array.from({ length: 6 }, (_, index) => value[index] ?? "");

  function setAt(index: number, next: string) {
    const digit = next.replace(/\D/g, "").slice(-1);
    const array = [...chars];
    array[index] = digit;
    onChange(array.join(""));
    if (digit && index < 5) refs.current[index + 1]?.focus();
  }

  function onPaste(text: string) {
    const digits = text.replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    onChange(digits);
    refs.current[Math.min(digits.length, 6) - 1]?.focus();
  }

  return (
    <div
      className="ko-otp"
      onPaste={(event) => {
        event.preventDefault();
        onPaste(event.clipboardData.getData("text"));
      }}
    >
      {chars.map((char, index) => (
        <input
          key={index}
          ref={(node) => { refs.current[index] = node; }}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={char}
          aria-label={`Verification digit ${index + 1}`}
          onChange={(event) => setAt(index, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !char && index > 0) {
              refs.current[index - 1]?.focus();
            }
          }}
        />
      ))}
    </div>
  );
}
