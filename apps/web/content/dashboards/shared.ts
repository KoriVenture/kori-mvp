import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  CircleDollarSign,
  FileText,
  Gauge,
  HandCoins,
  Landmark,
  ListChecks,
  Network,
  ReceiptText,
  Rocket,
  Target,
  Users,
} from "lucide-react";

export type DashboardRoleId =
  "fund-manager" | "angel-investor" | "startup-founder";

export type DashboardView =
  | "overview"
  | "spvs"
  | "pipeline"
  | "deals"
  | "portfolio"
  | "raise"
  | "investors"
  | "milestones"
  | "transactions"
  | "disbursements"
  | "documents";

export type DashboardNavigationItem = {
  view: DashboardView;
  segment: string;
  labelKey: string;
  icon: LucideIcon;
};

export type DashboardRoleConfig = {
  id: DashboardRoleId;
  namespace: "fund-manager" | "angel-investor" | "startup-founder";
  userName: string;
  userInitials: string;
  navigation: readonly DashboardNavigationItem[];
};

export type MetricRecord = {
  labelKey: string;
  value: string;
  detailKey: string;
  tone?: "default" | "gold" | "teal";
};

export type ActivityRecord = {
  id: string;
  textValues?: Record<string, number | string | undefined>;
  timeValues?: Record<string, number | string | undefined>;
  tone?: "default" | "gold" | "teal";
};

export type MilestoneStatus = "complete" | "current" | "upcoming";
export type MilestoneAmountState = "released" | "pending" | "locked";

export type BusinessStatus =
  | "accepted"
  | "active"
  | "approved"
  | "closed"
  | "confirmed"
  | "demo"
  | "draft"
  | "drafting"
  | "executed"
  | "fundraising"
  | "in_review"
  | "internal"
  | "invited"
  | "open"
  | "pending"
  | "released"
  | "shared"
  | "signed"
  | "verified";

export type MilestoneRecord = {
  id: string;
  amount: string;
  amountState: MilestoneAmountState;
  status: MilestoneStatus;
};

export const dashboardRoleConfigs = {
  "fund-manager": {
    id: "fund-manager",
    namespace: "fund-manager",
    userName: "Adaeze Chukwu",
    userInitials: "AC",
    navigation: [
      { view: "overview", segment: "", labelKey: "overview", icon: Gauge },
      { view: "spvs", segment: "spvs", labelKey: "spvs", icon: Landmark },
      {
        view: "pipeline",
        segment: "pipeline",
        labelKey: "pipeline",
        icon: BriefcaseBusiness,
      },
      {
        view: "milestones",
        segment: "milestones",
        labelKey: "milestones",
        icon: ListChecks,
      },
      {
        view: "investors",
        segment: "investors",
        labelKey: "investors",
        icon: Users,
      },
    ],
  },
  "angel-investor": {
    id: "angel-investor",
    namespace: "angel-investor",
    userName: "Amara Osei",
    userInitials: "AO",
    navigation: [
      { view: "overview", segment: "", labelKey: "overview", icon: Gauge },
      {
        view: "deals",
        segment: "deals",
        labelKey: "deals",
        icon: Target,
      },
      {
        view: "portfolio",
        segment: "portfolio",
        labelKey: "portfolio",
        icon: BriefcaseBusiness,
      },
      {
        view: "milestones",
        segment: "milestones",
        labelKey: "milestones",
        icon: ListChecks,
      },
      {
        view: "transactions",
        segment: "transactions",
        labelKey: "transactions",
        icon: ReceiptText,
      },
    ],
  },
  "startup-founder": {
    id: "startup-founder",
    namespace: "startup-founder",
    userName: "Njeri Kamau",
    userInitials: "NK",
    navigation: [
      { view: "overview", segment: "", labelKey: "overview", icon: Gauge },
      { view: "raise", segment: "raise", labelKey: "raise", icon: Rocket },
      {
        view: "investors",
        segment: "investors",
        labelKey: "investors",
        icon: Users,
      },
      {
        view: "milestones",
        segment: "milestones",
        labelKey: "milestones",
        icon: ListChecks,
      },
      {
        view: "disbursements",
        segment: "disbursements",
        labelKey: "disbursements",
        icon: HandCoins,
      },
      {
        view: "documents",
        segment: "documents",
        labelKey: "documents",
        icon: FileText,
      },
    ],
  },
} as const satisfies Record<DashboardRoleId, DashboardRoleConfig>;

export const dashboardRouteRecords = Object.values(
  dashboardRoleConfigs,
).flatMap((role) =>
  role.navigation.map((item) => ({
    role: role.id,
    view: item.view,
    segment: item.segment,
  })),
);

export const transactionNotice =
  "Demonstration record only. No real funds or blockchain transactions are represented.";

export const dashboardIcons = {
  network: Network,
  capital: CircleDollarSign,
};
