import { supportedLocales } from "@kori/i18n";
import { describe, expect, it } from "vitest";

import { loadMessages, messageNamespaces } from "./messages";

const requiredNamespaces = [
  "common",
  "navigation",
  "status",
  "validation",
  "landing",
  "stories",
  "capital-map",
  "dashboard-common",
  "fund-manager",
  "angel-investor",
  "startup-founder",
  "simulator",
] as const;

function leafKeys(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return [prefix];
  if (!value || typeof value !== "object") return [];

  return Object.entries(value).flatMap(([key, child]) =>
    leafKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("localized messages", () => {
  it("loads every required namespace with matching recursive keys", async () => {
    const catalogs = await Promise.all(supportedLocales.map(loadMessages));
    const expected = leafKeys(catalogs[0]).sort();

    expect(messageNamespaces).toEqual(requiredNamespaces);
    expect(Object.keys(catalogs[0])).toEqual(requiredNamespaces);
    for (const catalog of catalogs) {
      expect(leafKeys(catalog).sort()).toEqual(expected);
    }
  });

  it("provides representative copy for every reconstructed surface", async () => {
    const catalog = await loadMessages("en");

    expect(catalog.landing.hero.eyebrow).toBe(
      "Diaspora Investment Infrastructure",
    );
    expect(catalog.stories.hero.eyebrow).toBe("Success Stories");
    expect(catalog["capital-map"].hero.eyebrow).toBe("Capital Map");
    expect(catalog["dashboard-common"].navigation.simulator).toBe(
      "Contract Simulator",
    );
    expect(catalog["fund-manager"].meta.title).toContain("Fund Manager");
    expect(catalog["angel-investor"].meta.title).toContain("Angel Investor");
    expect(catalog["startup-founder"].meta.title).toContain("Startup Founder");
    expect(catalog.simulator.demoLabel).toContain("Demonstration");
  });
});
