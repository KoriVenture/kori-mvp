import {
  capitalMapStats,
  connectedCountrySummary,
  investorCountries,
  recipientCountries,
} from "@/content/capital-map";
import { stories } from "@/content/stories";
import { describe, expect, it } from "vitest";

describe("canonical public content", () => {
  it("keeps the three success stories and their audited figures", () => {
    expect(
      stories.map((story) => ({
        name: story.name,
        figures: story.figures.slice(0, 4).map((figure) => figure.value),
      })),
    ).toEqual([
      { name: "Kofi Mensah", figures: ["$2.4M", "3", "$1.6M", "18"] },
      { name: "Amara Osei", figures: ["$185K", "3", "$78K", "5/9"] },
      { name: "Wanjiku Mwangi", figures: ["$480K", "$280K", "8", "2/4"] },
    ]);
  });

  it("keeps the canonical map-less country data and disclosed inconsistency", () => {
    expect(capitalMapStats.map((stat) => stat.value)).toEqual([
      "$4.8M",
      "$3.2M",
      "12",
      "47",
      "$1.6M",
    ]);
    expect(investorCountries).toHaveLength(7);
    expect(recipientCountries).toHaveLength(10);
    expect(investorCountries.at(-1)?.displayedTotal).toBe("$4,800,000");
    expect(recipientCountries.at(-1)?.displayedTotal).toBe("$3,200,000");
    expect(connectedCountrySummary).toEqual({
      displayed: 12,
      listedDistinctCountries: 17,
    });
  });
});
