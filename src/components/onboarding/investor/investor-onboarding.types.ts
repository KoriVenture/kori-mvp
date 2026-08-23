export type SecurityMethod = "passkey" | "totp" | "sms";

export type InvestorOnboardingDraft = {
  email: string;
  password: string;
  country: string;
  accountTerms: boolean;
  newsletter: boolean;
  securityMethod: SecurityMethod;
  emailVerified: boolean;
  legalFirstName: string;
  legalLastName: string;
  city: string;
  timezone: string;
  linkedinUrl: string;
  professionalTitle: string;
  organization: string;
  biography: string;
  photoPath: string;
  photoUrl: string;
  languages: string[];
  investorType: "individual" | "fund_manager";
  expertiseAreas: string[];
  askMeAbout: string;
  preferredRegions: string[];
  investmentStages: string[];
  preferredTicketSizes: string[];
  preferredInstruments: string[];
  investmentHorizon: string;
  investmentThesis: string;
  investorClassification: string;
  investmentExperience: string;
  privateCompanyExperience: "Yes" | "No" | "Some" | "";
  sourceOfFunds: string;
  riskAcknowledged: boolean;
  terms: boolean;
  privacy: boolean;
  platform: boolean;
  investmentRisk: boolean;
  signatureName: string;
};

export const initialInvestorDraft: InvestorOnboardingDraft = {
  email: "",
  password: "",
  country: "",
  accountTerms: false,
  newsletter: false,
  securityMethod: "passkey",
  emailVerified: false,
  legalFirstName: "",
  legalLastName: "",
  city: "",
  timezone: "",
  linkedinUrl: "",
  professionalTitle: "",
  organization: "",
  biography: "",
  photoPath: "",
  photoUrl: "/assets/onboarding/investor/profile-photo.png",
  languages: [],
  investorType: "individual",
  expertiseAreas: [],
  askMeAbout: "",
  preferredRegions: [],
  investmentStages: [],
  preferredTicketSizes: [],
  preferredInstruments: [],
  investmentHorizon: "",
  investmentThesis: "",
  investorClassification: "",
  investmentExperience: "",
  privateCompanyExperience: "",
  sourceOfFunds: "",
  riskAcknowledged: false,
  terms: true,
  privacy: true,
  platform: false,
  investmentRisk: false,
  signatureName: "",
};
