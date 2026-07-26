import { describe, expect, it } from "vitest";

import {
  dashboardRoleConfigs,
  dashboardRouteRecords,
} from "@/content/dashboards/shared";
import { fundManagerData } from "@/content/dashboards/fund-manager";
import { angelInvestorData } from "@/content/dashboards/angel-investor";
import { startupFounderData } from "@/content/dashboards/startup-founder";

describe("dashboard route contracts", () => {
  it("exposes every historical view as an addressable route", () => {
    expect(
      dashboardRouteRecords.map(({ role, view, segment }) => ({
        role,
        view,
        segment,
      })),
    ).toEqual([
      { role: "fund-manager", view: "overview", segment: "" },
      { role: "fund-manager", view: "spvs", segment: "spvs" },
      { role: "fund-manager", view: "pipeline", segment: "pipeline" },
      { role: "fund-manager", view: "milestones", segment: "milestones" },
      { role: "fund-manager", view: "investors", segment: "investors" },
      { role: "angel-investor", view: "overview", segment: "" },
      { role: "angel-investor", view: "deals", segment: "deals" },
      { role: "angel-investor", view: "portfolio", segment: "portfolio" },
      { role: "angel-investor", view: "milestones", segment: "milestones" },
      {
        role: "angel-investor",
        view: "transactions",
        segment: "transactions",
      },
      { role: "startup-founder", view: "overview", segment: "" },
      { role: "startup-founder", view: "raise", segment: "raise" },
      { role: "startup-founder", view: "investors", segment: "investors" },
      { role: "startup-founder", view: "milestones", segment: "milestones" },
      {
        role: "startup-founder",
        view: "disbursements",
        segment: "disbursements",
      },
      { role: "startup-founder", view: "documents", segment: "documents" },
    ]);
  });

  it("keeps route, navigation, and translation contracts synchronized", () => {
    for (const role of Object.values(dashboardRoleConfigs)) {
      expect(role.navigation).toHaveLength(
        dashboardRouteRecords.filter((route) => route.role === role.id).length,
      );
      expect(role.navigation[0]?.segment).toBe("");
      expect(new Set(role.navigation.map((item) => item.segment)).size).toBe(
        role.navigation.length,
      );
    }
  });
});

describe("canonical dashboard fixtures", () => {
  it("preserves the Fund Manager foundation", () => {
    expect(fundManagerData.metrics.map(({ value }) => value)).toEqual([
      "$2.4M",
      "3",
      "18",
      "$1.6M",
    ]);
    expect(fundManagerData.spvs).toHaveLength(4);
    expect(fundManagerData.pipeline.map(({ deals }) => deals.length)).toEqual([
      3, 2, 1, 2,
    ]);
    expect(fundManagerData.investors).toHaveLength(6);
  });

  it("preserves the Angel Investor foundation", () => {
    expect(angelInvestorData.metrics.map(({ value }) => value)).toEqual([
      "$185K",
      "$62K",
      "3",
      "5/9",
    ]);
    expect(angelInvestorData.deals).toHaveLength(5);
    expect(angelInvestorData.portfolio).toHaveLength(3);
  });

  it("preserves the Startup Founder foundation", () => {
    expect(startupFounderData.metrics.map(({ value }) => value)).toEqual([
      "$480K",
      "$280K",
      "$120K",
      "8",
    ]);
    expect(startupFounderData.milestones).toHaveLength(4);
    expect(startupFounderData.documents.length).toBeGreaterThanOrEqual(6);
  });
});
