import {
  contributors,
  landingSectionOrder,
  landingStats,
  processSteps,
} from "@/content/landing";
import { describe, expect, it } from "vitest";

describe("canonical landing content", () => {
  it("keeps the redesigned section blocks in their canonical order", () => {
    expect(landingSectionOrder).toEqual([
      "navigation",
      "hero",
      "market-proof",
      "how",
      "thesis",
      "solution",
      "waitlist",
      "footer",
    ]);
  });

  it("centralizes the market-proof figures and the sequence lengths", () => {
    expect(landingStats.map((stat) => stat.value)).toEqual([
      "$100B",
      "$421B",
      "$3.9B",
    ]);
    // How-it-works is an ordered chain of six steps; the thesis lists six
    // equal, unordered knowledge sources.
    expect(processSteps).toHaveLength(6);
    expect(contributors).toHaveLength(6);
  });
});
