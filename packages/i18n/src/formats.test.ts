import { describe, expect, it } from "vitest";

import { createCurrencyFormat, dateTimeFormats, numberFormats } from "./index";

describe("formatting contract", () => {
  it("provides reusable date and non-currency number formats", () => {
    expect(dateTimeFormats.shortDate).toEqual({
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    expect(numberFormats.percent).toEqual({
      style: "percent",
      maximumFractionDigits: 1,
    });
  });

  it("requires currency to be an explicit uppercase ISO-style code", () => {
    expect(createCurrencyFormat("CAD")).toMatchObject({
      style: "currency",
      currency: "CAD",
    });
    expect(() => createCurrencyFormat("cad")).toThrow(RangeError);
    expect(() => createCurrencyFormat("USDC")).toThrow(RangeError);
  });
});
