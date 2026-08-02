export const landingSectionOrder = [
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
] as const;

export const landingStats = [
  {
    id: "funding-gap",
    value: "$1.3T",
    labelKey: "statistics.fundingGap.label",
    descriptionKey: "statistics.fundingGap.description",
  },
  {
    id: "vc-decline",
    value: "53%",
    labelKey: "statistics.vcDecline.label",
    descriptionKey: "statistics.vcDecline.description",
  },
  {
    id: "remittances",
    value: "$100B+",
    labelKey: "statistics.remittances.label",
    descriptionKey: "statistics.remittances.description",
  },
] as const;

export const landingRoles = [
  {
    id: "fund-manager",
    glyph: "◈",
    href: "/dashboard/fund-manager",
    titleKey: "profiles.fundManager.title",
    descriptionKey: "profiles.fundManager.description",
  },
  {
    id: "angel-investor",
    glyph: "◇",
    href: "/dashboard/angel-investor",
    titleKey: "profiles.angelInvestor.title",
    descriptionKey: "profiles.angelInvestor.description",
  },
  {
    id: "startup-founder",
    glyph: "△",
    href: "/dashboard/startup-founder",
    titleKey: "profiles.startupFounder.title",
    descriptionKey: "profiles.startupFounder.description",
  },
] as const;

export const problemItems = ["01", "02", "03", "04"] as const;

export const solutionPillars = [
  { id: "transparency", glyph: "◎" },
  { id: "purpose", glyph: "⬡" },
  { id: "access", glyph: "⊕" },
  { id: "rails", glyph: "≋" },
] as const;

export const processSteps = [
  { id: "vetted", number: "01" },
  { id: "syndicate", number: "02" },
  { id: "settlement", number: "03" },
] as const;

export const whyNowSignals = [
  "cycle",
  "infrastructure",
  "asymmetry",
  "validation",
] as const;
