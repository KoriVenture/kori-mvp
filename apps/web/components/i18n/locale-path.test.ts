import { describe, expect, it } from "vitest";

import { withSearchParams } from "./locale-path";

describe("locale route preservation", () => {
  it("keeps the pathname and applicable query parameters", () => {
    expect(
      withSearchParams("/dashboard/investor", "deal=solar&tab=milestones"),
    ).toBe("/dashboard/investor?deal=solar&tab=milestones");
    expect(withSearchParams("/", "")).toBe("/");
  });
});
