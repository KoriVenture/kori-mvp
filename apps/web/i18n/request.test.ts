import { describe, expect, it } from "vitest";

import { resolveRequestLocale } from "./request";

describe("request locale resolution", () => {
  it("accepts supported locales and rejects unsupported values", () => {
    expect(resolveRequestLocale("en")).toBe("en");
    expect(resolveRequestLocale("fr")).toBe("fr");
    expect(resolveRequestLocale("es")).toBe("es");
    expect(resolveRequestLocale("de")).toBeNull();
    expect(resolveRequestLocale(undefined)).toBeNull();
  });
});
