export type StoryFigureTone = "gold" | "ivory" | "teal";

export type StoryRecord = {
  id: "fund-manager" | "angel-investor" | "startup-founder";
  name: string;
  paragraphs: readonly string[];
  figures: readonly {
    labelKey: string;
    tone: StoryFigureTone;
    value: string;
  }[];
  tags: readonly string[];
  timeline: readonly {
    date: string;
    status: "done" | "current";
    textKey: string;
  }[];
};

export const stories: readonly StoryRecord[] = [
  {
    id: "fund-manager",
    name: "Kofi Mensah",
    paragraphs: ["one", "two", "three", "four"],
    figures: [
      { labelKey: "aum", value: "$2.4M", tone: "gold" },
      { labelKey: "spvs", value: "3", tone: "ivory" },
      { labelKey: "deployed", value: "$1.6M", tone: "teal" },
      { labelKey: "investors", value: "18", tone: "ivory" },
      { labelKey: "countries", value: "6", tone: "ivory" },
      { labelKey: "setup", value: "5 days", tone: "teal" },
      { labelKey: "savings", value: "~80%", tone: "teal" },
    ],
    tags: ["Energy", "Agritech", "Edtech", "Kenya", "Ghana", "Ethiopia"],
    timeline: [
      { textKey: "joined", date: "January 2026", status: "done" },
      { textKey: "solar", date: "February 2026", status: "done" },
      { textKey: "edu", date: "March 2026", status: "done" },
      { textKey: "agri", date: "April 2026", status: "current" },
    ],
  },
  {
    id: "angel-investor",
    name: "Amara Osei",
    paragraphs: ["one", "two", "three", "four"],
    figures: [
      { labelKey: "invested", value: "$185K", tone: "gold" },
      { labelKey: "spvs", value: "3", tone: "ivory" },
      { labelKey: "released", value: "$78K", tone: "teal" },
      { labelKey: "milestones", value: "5/9", tone: "ivory" },
      { labelKey: "settlement", value: "USDC", tone: "teal" },
      { labelKey: "fees", value: "~$5,500", tone: "teal" },
      { labelKey: "first", value: "48 hours", tone: "teal" },
    ],
    tags: ["Energy", "Edtech", "Agritech", "Diaspora — Toronto"],
    timeline: [
      { textKey: "joined", date: "February 2026", status: "done" },
      { textKey: "release", date: "March 2026", status: "done" },
      { textKey: "expanded", date: "March–April 2026", status: "done" },
      { textKey: "portfolio", date: "April 2026", status: "current" },
    ],
  },
  {
    id: "startup-founder",
    name: "Wanjiku Mwangi",
    paragraphs: ["one", "two", "three", "four", "five"],
    figures: [
      { labelKey: "raised", value: "$480K", tone: "gold" },
      { labelKey: "received", value: "$280K", tone: "teal" },
      { labelKey: "investors", value: "8", tone: "ivory" },
      { labelKey: "milestones", value: "2/4", tone: "ivory" },
      { labelKey: "units", value: "50", tone: "teal" },
      { labelKey: "capitalTime", value: "3 weeks", tone: "teal" },
      { labelKey: "fees", value: "~$14,400", tone: "teal" },
    ],
    tags: ["Energy", "Hardware", "Pay-as-you-go", "Kenya", "Seed Stage"],
    timeline: [
      { textKey: "applied", date: "January 2026", status: "done" },
      { textKey: "committed", date: "February 2026", status: "done" },
      { textKey: "m1", date: "March 2026", status: "done" },
      { textKey: "m2", date: "April 2026", status: "done" },
      { textKey: "m3", date: "May 2026", status: "current" },
    ],
  },
] as const;
