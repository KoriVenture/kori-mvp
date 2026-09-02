export const USDC_SCALE = 10_000_000n;

export function parseUsdc(value: string) {
  const normalized = value.trim();

  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,7})?$/.test(normalized)) {
    throw new Error("Enter a positive USDC amount with at most 7 decimals.");
  }

  const [whole, fraction = ""] = normalized.split(".");
  const baseUnits =
    BigInt(whole) * USDC_SCALE + BigInt(fraction.padEnd(7, "0") || "0");

  if (baseUnits <= 0n) {
    throw new Error("The funding amount must be greater than zero.");
  }

  return baseUnits;
}

export function formatUsdc(baseUnits: bigint) {
  const sign = baseUnits < 0n ? "-" : "";
  const absolute = baseUnits < 0n ? -baseUnits : baseUnits;
  const whole = absolute / USDC_SCALE;
  const fraction = (absolute % USDC_SCALE)
    .toString()
    .padStart(7, "0")
    .replace(/0+$/, "");

  return `${sign}${whole}${fraction ? `.${fraction}` : ""}`;
}
