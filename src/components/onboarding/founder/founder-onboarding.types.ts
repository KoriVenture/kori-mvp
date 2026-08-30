export const founderScreenNames = [
  "Account",
  "Security",
  "Founder Profile",
  "Startup Profile",
  "Startup Documents",
  "Review",
  "Complete",
] as const;

export type FounderDraft = {
  email: string;
  password: string;
  country: string;
  accountTerms: boolean;
  newsletter: boolean;
  emailVerified: boolean;
  legalFirstName: string;
  legalLastName: string;
  city: string;
  timezone: string;
  linkedinUrl: string;
  professionalTitle: string;
  biography: string;
  startupId: string;
  legalName: string;
  displayName: string;
  startupCountry: string;
  sector: string;
  website: string;
  description: string;
  foundingYear: string;
  stage: string;
  terms: boolean;
  privacy: boolean;
  platform: boolean;
  signatureName: string;
};

export const initialFounderDraft: FounderDraft = {
  email: "",
  password: "",
  country: "",
  accountTerms: false,
  newsletter: false,
  emailVerified: false,
  legalFirstName: "",
  legalLastName: "",
  city: "",
  timezone: "",
  linkedinUrl: "",
  professionalTitle: "",
  biography: "",
  startupId: "",
  legalName: "",
  displayName: "",
  startupCountry: "",
  sector: "",
  website: "",
  description: "",
  foundingYear: "",
  stage: "",
  terms: true,
  privacy: true,
  platform: false,
  signatureName: "",
};
