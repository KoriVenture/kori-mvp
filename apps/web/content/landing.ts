export const landingSectionOrder = [
  "navigation",
  "hero",
  "market-proof",
  "how",
  "thesis",
  "solution",
  "waitlist",
  "footer",
] as const;

// Market-proof figures. Sourced from the Kori brand system; each still
// needs a citation + date before launch (see PR notes), which is why the
// section renders a "Sources — pending" marker.
export const landingStats = [
  { id: "remittances", value: "$100B" },
  { id: "financingGap", value: "$421B" },
  { id: "venture", value: "$3.9B" },
] as const;

// Ordered — signals precede diligence precedes settlement. The chain
// renders this as a numbered sequence, so order carries meaning.
export const processSteps = [
  "signals",
  "diligence",
  "spv",
  "onboarding",
  "settlement",
  "milestones",
] as const;

// Unordered — six equal knowledge sources. Deliberately not numbered:
// ranking them would imply a hierarchy the thesis explicitly denies.
export const contributors = [
  "sectorExperts",
  "localOperators",
  "diasporaProfessionals",
  "founders",
  "institutionalInvestors",
  "independentVerifiers",
] as const;

export const solutionIndex = ["expertise", "network", "discovery"] as const;

export const stancePairs = ["ambition", "promise"] as const;
