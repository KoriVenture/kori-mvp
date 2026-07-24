export const capitalMapStats = [
  { id: "invested", value: "$4.8M", tone: "gold" },
  { id: "received", value: "$3.2M", tone: "teal" },
  { id: "countries", value: "12", tone: "ivory" },
  { id: "investors", value: "47", tone: "ivory" },
  { id: "locked", value: "$1.6M", tone: "teal" },
] as const;

export type CountryRecord = {
  amount: string;
  code: string;
  detail: string;
  displayedTotal?: string;
  flag: string;
  id: string;
  name: string;
  percentage: number;
};

export const investorCountries: readonly CountryRecord[] = [
  {
    id: "united-states",
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    detail: "18 investors · Atlanta, Houston, NYC, DMV",
    amount: "$1,850K",
    percentage: 100,
  },
  {
    id: "canada",
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    detail: "8 investors · Toronto, Montreal, Calgary",
    amount: "$920K",
    percentage: 50,
  },
  {
    id: "united-kingdom",
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    detail: "7 investors · London, Manchester, Birmingham",
    amount: "$780K",
    percentage: 42,
  },
  {
    id: "france",
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    detail: "6 investors · Paris, Lyon, Marseille",
    amount: "$540K",
    percentage: 29,
  },
  {
    id: "germany",
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    detail: "4 investors · Berlin, Frankfurt",
    amount: "$340K",
    percentage: 18,
  },
  {
    id: "belgium",
    code: "BE",
    name: "Belgium",
    flag: "🇧🇪",
    detail: "2 investors · Brussels, Antwerp",
    amount: "$210K",
    percentage: 11,
  },
  {
    id: "netherlands",
    code: "NL",
    name: "Netherlands",
    flag: "🇳🇱",
    detail: "2 investors · Amsterdam, Rotterdam",
    amount: "$160K",
    percentage: 9,
    displayedTotal: "$4,800,000",
  },
] as const;

export const recipientCountries: readonly CountryRecord[] = [
  {
    id: "kenya",
    code: "KE",
    name: "Kenya",
    flag: "🇰🇪",
    detail: "3 startups · Energy, Agritech, Fintech",
    amount: "$980K",
    percentage: 100,
  },
  {
    id: "nigeria",
    code: "NG",
    name: "Nigeria",
    flag: "🇳🇬",
    detail: "2 startups · Healthcare, Logistics",
    amount: "$620K",
    percentage: 63,
  },
  {
    id: "ghana",
    code: "GH",
    name: "Ghana",
    flag: "🇬🇭",
    detail: "2 startups · Agritech, Edtech",
    amount: "$480K",
    percentage: 49,
  },
  {
    id: "ethiopia",
    code: "ET",
    name: "Ethiopia",
    flag: "🇪🇹",
    detail: "1 startup · Edtech",
    amount: "$350K",
    percentage: 36,
  },
  {
    id: "south-africa",
    code: "ZA",
    name: "South Africa",
    flag: "🇿🇦",
    detail: "1 startup · Healthcare",
    amount: "$280K",
    percentage: 29,
  },
  {
    id: "jamaica",
    code: "JM",
    name: "Jamaica",
    flag: "🇯🇲",
    detail: "1 startup · Fintech",
    amount: "$180K",
    percentage: 18,
  },
  {
    id: "rwanda",
    code: "RW",
    name: "Rwanda",
    flag: "🇷🇼",
    detail: "1 startup · Logistics",
    amount: "$120K",
    percentage: 12,
  },
  {
    id: "trinidad-tobago",
    code: "TT",
    name: "Trinidad and Tobago",
    flag: "🇹🇹",
    detail: "1 startup · Energy",
    amount: "$110K",
    percentage: 11,
  },
  {
    id: "tanzania",
    code: "TZ",
    name: "Tanzania",
    flag: "🇹🇿",
    detail: "1 startup · Supply Chain",
    amount: "$55K",
    percentage: 6,
  },
  {
    id: "haiti",
    code: "HT",
    name: "Haiti",
    flag: "🇭🇹",
    detail: "1 startup · Infrastructure",
    amount: "$25K",
    percentage: 3,
    displayedTotal: "$3,200,000",
  },
] as const;

export const connectedCountrySummary = {
  displayed: 12,
  listedDistinctCountries: 17,
} as const;
