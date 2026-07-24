import type { ActivityRecord, MetricRecord, MilestoneRecord } from "./shared";

const solarMilestones: MilestoneRecord[] = [
  {
    id: "solarEntity",
    amount: "$150K",
    amountState: "released",
    status: "complete",
  },
  {
    id: "solarPilot",
    amount: "$130K",
    amountState: "released",
    status: "complete",
  },
  {
    id: "solarRevenue",
    amount: "$120K",
    amountState: "pending",
    status: "current",
  },
  {
    id: "solarScale",
    amount: "$80K",
    amountState: "locked",
    status: "upcoming",
  },
];

const eduMilestones: MilestoneRecord[] = [
  {
    id: "eduPlatform",
    amount: "$100K",
    amountState: "released",
    status: "complete",
  },
  {
    id: "eduPartnerships",
    amount: "$90K",
    amountState: "pending",
    status: "current",
  },
  {
    id: "eduEnrollments",
    amount: "$60K",
    amountState: "locked",
    status: "upcoming",
  },
];

export const fundManagerData = {
  metrics: [
    {
      labelKey: "aum",
      value: "$2.4M",
      detailKey: "aumDetail",
      tone: "gold",
    },
    {
      labelKey: "activeSpvs",
      value: "3",
      detailKey: "activeSpvsDetail",
      tone: "teal",
    },
    {
      labelKey: "investors",
      value: "18",
      detailKey: "investorsDetail",
    },
    {
      labelKey: "deployed",
      value: "$1.6M",
      detailKey: "deployedDetail",
    },
  ] satisfies MetricRecord[],
  activities: [
    {
      id: "milestoneApproved",
      textValues: { milestone: 2, spv: "SolarGrid Kenya SPV" },
      timeValues: { count: 2 },
      tone: "teal",
    },
    {
      id: "commitment",
      textValues: {
        investor: "Amara Osei",
        amount: "$50K",
        spv: "AgriFlow Ghana SPV",
      },
      timeValues: { count: 5 },
      tone: "gold",
    },
    {
      id: "contractCreated",
      textValues: { spv: "EduBridge Ethiopia SPV" },
      timeValues: { count: 1 },
      tone: "teal",
    },
    {
      id: "agreementSigned",
      textValues: { investor: "Kwame Mensah" },
      timeValues: { count: 2 },
    },
    {
      id: "trancheReleased",
      textValues: { amount: "$150K", milestone: 1 },
      timeValues: { count: 3 },
      tone: "gold",
    },
  ] satisfies ActivityRecord[],
  topInvestors: [
    {
      initials: "AO",
      name: "Amara Osei",
      detail: "3 SPVs · Toronto, Canada",
      amount: "$350K",
    },
    {
      initials: "DK",
      name: "Daniel Kimathi",
      detail: "2 SPVs · London, UK",
      amount: "$250K",
    },
    {
      initials: "FA",
      name: "Fatou Adeyemi",
      detail: "2 SPVs · Paris, France",
      amount: "$200K",
    },
    {
      initials: "SK",
      name: "Samuel Kofi",
      detail: "1 SPV · Atlanta, USA",
      amount: "$150K",
    },
  ],
  spvs: [
    {
      name: "SolarGrid Kenya SPV",
      target: "$500K",
      committed: "$480K",
      investors: "8",
      status: "active",
      sector: "energy",
      tone: "teal",
    },
    {
      name: "AgriFlow Ghana SPV",
      target: "$350K",
      committed: "$275K",
      investors: "6",
      status: "fundraising",
      sector: "agritech",
      tone: "gold",
    },
    {
      name: "EduBridge Ethiopia SPV",
      target: "$250K",
      committed: "$250K",
      investors: "4",
      status: "active",
      sector: "edtech",
      tone: "teal",
    },
    {
      name: "HealthLink SA SPV",
      target: "$400K",
      committed: "—",
      investors: "0",
      status: "draft",
      sector: "healthcare",
      tone: "neutral",
    },
  ] as const,
  pipeline: [
    {
      id: "sourcing",
      deals: [
        {
          id: "mediTrack",
          name: "MediTrack Nigeria",
          amount: "$300K",
          amountKind: "ask",
          sector: "healthcare",
        },
        {
          id: "payShift",
          name: "PayShift Rwanda",
          amount: "$200K",
          amountKind: "ask",
          sector: "fintech",
        },
        {
          id: "cleanWater",
          name: "CleanWater DRC",
          amount: "$150K",
          amountKind: "ask",
          sector: "infrastructure",
        },
      ],
    },
    {
      id: "diligence",
      deals: [
        {
          id: "healthLink",
          name: "HealthLink South Africa",
          amount: "$400K",
          amountKind: "ask",
          sector: "healthcare",
        },
        {
          id: "logiChain",
          name: "LogiChain Tanzania",
          amount: "$250K",
          amountKind: "ask",
          sector: "logistics",
        },
      ],
    },
    {
      id: "termSheet",
      deals: [
        {
          id: "agriFlow",
          name: "AgriFlow Ghana",
          amount: "$350K",
          amountKind: "safe",
          sector: "agritech",
        },
      ],
    },
    {
      id: "deployed",
      deals: [
        {
          id: "solarGrid",
          name: "SolarGrid Kenya",
          amount: "$480K",
          amountKind: "deployed",
          sector: "energy",
        },
        {
          id: "eduBridge",
          name: "EduBridge Ethiopia",
          amount: "$250K",
          amountKind: "deployed",
          sector: "edtech",
        },
      ],
    },
  ] as const,
  milestoneGroups: [
    { name: "SolarGrid Kenya SPV", milestones: solarMilestones },
    { name: "EduBridge Ethiopia SPV", milestones: eduMilestones },
  ],
  investors: [
    {
      name: "Amara Osei",
      location: "Toronto, Canada",
      committed: "$350K",
      spvs: "3",
      status: "active",
      joined: "Jan 2025",
    },
    {
      name: "Daniel Kimathi",
      location: "London, UK",
      committed: "$250K",
      spvs: "2",
      status: "active",
      joined: "Feb 2025",
    },
    {
      name: "Fatou Adeyemi",
      location: "Paris, France",
      committed: "$200K",
      spvs: "2",
      status: "active",
      joined: "Feb 2025",
    },
    {
      name: "Samuel Kofi",
      location: "Atlanta, USA",
      committed: "$150K",
      spvs: "1",
      status: "active",
      joined: "Mar 2025",
    },
    {
      name: "Ngozi Eze",
      location: "Houston, USA",
      committed: "$100K",
      spvs: "1",
      status: "active",
      joined: "Mar 2025",
    },
    {
      name: "Yves Ndayisaba",
      location: "Brussels, Belgium",
      committed: "—",
      spvs: "0",
      status: "invited",
      joined: "Apr 2025",
    },
  ],
} as const;
