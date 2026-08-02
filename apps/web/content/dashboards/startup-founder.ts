import type { ActivityRecord, MetricRecord, MilestoneRecord } from "./shared";

const founderMilestones: MilestoneRecord[] = [
  {
    id: "entity",
    amount: "$150K",
    amountState: "released",
    status: "complete",
  },
  {
    id: "pilot",
    amount: "$130K",
    amountState: "released",
    status: "complete",
  },
  {
    id: "revenue",
    amount: "$120K",
    amountState: "pending",
    status: "current",
  },
  {
    id: "scale",
    amount: "$80K",
    amountState: "locked",
    status: "upcoming",
  },
];

export const startupFounderData = {
  metrics: [
    {
      labelKey: "raised",
      value: "$480K",
      detailKey: "raisedDetail",
      tone: "gold",
    },
    {
      labelKey: "received",
      value: "$280K",
      detailKey: "receivedDetail",
      tone: "teal",
    },
    {
      labelKey: "nextTranche",
      value: "$120K",
      detailKey: "nextTrancheDetail",
    },
    {
      labelKey: "investors",
      value: "8",
      detailKey: "investorsDetail",
    },
  ] satisfies MetricRecord[],
  activities: [
    {
      id: "milestoneApproved",
      textValues: { milestone: 2, amount: "$130K" },
      timeValues: { count: 2 },
      tone: "teal",
    },
    {
      id: "evidenceRequested",
      timeValues: { milestone: 2, count: 6 },
      tone: "gold",
    },
    {
      id: "contractPreview",
      textValues: { contract: "KoriSPV.sol" },
      timeValues: { count: 1 },
    },
    {
      id: "firstMilestoneApproved",
      textValues: { milestone: 1, amount: "$150K" },
      timeValues: { count: 3 },
      tone: "teal",
    },
  ] satisfies ActivityRecord[],
  raise: {
    company: "SolarGrid Kenya",
    target: "$500K",
    committed: "$480K",
    percentage: 96,
    instrument: "safe",
    minimum: "$25K",
    closeDate: "2025-05-30",
    lead: "Kofi Mensah",
  },
  investors: [
    {
      name: "Kofi Mensah",
      location: "Toronto, Canada",
      committed: "$100K",
      share: "20.8%",
      status: "signed",
      role: "leadInvestor",
    },
    {
      name: "Amara Osei",
      location: "Toronto, Canada",
      committed: "$100K",
      share: "20.8%",
      status: "signed",
    },
    {
      name: "Daniel Kimathi",
      location: "London, UK",
      committed: "$75K",
      share: "15.6%",
      status: "signed",
    },
    {
      name: "Fatou Adeyemi",
      location: "Paris, France",
      committed: "$60K",
      share: "12.5%",
      status: "signed",
    },
    {
      name: "Samuel Kofi",
      location: "Atlanta, USA",
      committed: "$50K",
      share: "10.4%",
      status: "signed",
    },
    {
      name: "Ngozi Eze",
      location: "Houston, USA",
      committed: "$40K",
      share: "8.3%",
      status: "signed",
    },
    {
      name: "Yves Ndayisaba",
      location: "Brussels, Belgium",
      committed: "$30K",
      share: "6.3%",
      status: "pending",
    },
    {
      name: "Amina Tadesse",
      location: "Berlin, Germany",
      committed: "$25K",
      share: "5.2%",
      status: "signed",
    },
  ],
  milestones: founderMilestones,
  disbursementMetrics: [
    {
      labelKey: "totalReceived",
      value: "$280K",
      detailKey: "totalReceivedDetail",
      tone: "teal",
    },
    {
      labelKey: "pendingRelease",
      value: "$120K",
      detailKey: "pendingReleaseDetail",
      tone: "gold",
    },
    {
      labelKey: "locked",
      value: "$80K",
      detailKey: "lockedDetail",
    },
  ] satisfies MetricRecord[],
  disbursements: [
    {
      date: "2025-04-18",
      milestone: "pilot",
      amount: "$130K",
      status: "released",
      hash: "0x8fa2…91ce",
    },
    {
      date: "2025-01-19",
      milestone: "entity",
      amount: "$150K",
      status: "released",
      hash: "0x11aa…923d",
    },
    {
      date: null,
      milestone: "revenue",
      amount: "$120K",
      status: "in_review",
      hash: "—",
    },
  ],
  documents: [
    {
      id: "safeAgreement",
      category: "legal",
      date: "2025-04-12",
      status: "executed",
    },
    {
      id: "incorporationCertificate",
      category: "corporate",
      date: "2025-01-08",
      status: "verified",
    },
    {
      id: "energyLicense",
      category: "compliance",
      date: "2025-01-16",
      status: "approved",
    },
    {
      id: "investorPresentation",
      category: "fundraising",
      date: "2025-03-02",
      status: "shared",
    },
    {
      id: "financialModel",
      category: "finance",
      date: "2025-03-05",
      status: "shared",
    },
    {
      id: "boardMinutes",
      category: "governance",
      date: "2025-04-01",
      status: "internal",
    },
    {
      id: "pilotReport",
      category: "milestoneEvidence",
      date: "2025-04-15",
      status: "accepted",
    },
    {
      id: "customerContracts",
      category: "milestoneEvidence",
      date: "2025-04-16",
      status: "accepted",
    },
    {
      id: "revenuePack",
      category: "milestoneEvidence",
      date: null,
      status: "drafting",
    },
  ],
} as const;
