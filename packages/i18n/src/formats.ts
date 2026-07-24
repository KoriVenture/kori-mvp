export const dateTimeFormats = {
  shortDate: { year: "numeric", month: "short", day: "numeric" },
  longDate: { year: "numeric", month: "long", day: "numeric" },
  shortTime: { hour: "2-digit", minute: "2-digit" },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

export const numberFormats = {
  decimal: { maximumFractionDigits: 2 },
  percent: { style: "percent", maximumFractionDigits: 1 },
} as const satisfies Record<string, Intl.NumberFormatOptions>;

export function createCurrencyFormat(
  currency: string,
): Intl.NumberFormatOptions {
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new RangeError("Currency must be an uppercase ISO 4217 code");
  }

  return {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  };
}
