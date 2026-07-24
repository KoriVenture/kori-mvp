import {
  landingRoles,
  landingSectionOrder,
  landingStats,
} from "@/content/landing";
import { describe, expect, it } from "vitest";

describe("canonical landing content", () => {
  it("keeps the eleven historical blocks in their canonical order", () => {
    expect(landingSectionOrder).toEqual([
      "navigation",
      "hero",
      "statistics",
      "profiles",
      "problem",
      "solution",
      "process",
      "why-now",
      "audience",
      "waitlist",
      "footer",
    ]);
  });

  it("keeps canonical statistics and localized role destinations centralized", () => {
    expect(landingStats.map((stat) => stat.value)).toEqual([
      "$1.3T",
      "53%",
      "$100B+",
    ]);
    expect(landingRoles.map((role) => [role.glyph, role.href])).toEqual([
      ["◈", "/dashboard/fund-manager"],
      ["◇", "/dashboard/angel-investor"],
      ["△", "/dashboard/startup-founder"],
    ]);
  });
});
