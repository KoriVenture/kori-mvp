export const STELLAR_TESTNET = {
  network: "TESTNET",
  networkPassphrase: "Test SDF Network ; September 2015",
  rpcUrl:
    process.env.NEXT_PUBLIC_STELLAR_RPC_URL?.trim() ||
    "https://soroban-testnet.stellar.org",
  explorerUrl: "https://stellar.expert/explorer/testnet",
} as const;

export const STELLAR_TESTNET_USDC = {
  code: "USDC",
  issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  sacAddress: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  decimals: 7,
} as const;

export type DemoDealId = "kigali-transport" | "kingston-solar" | "accra-agro";

export type DemoReleaseSigner = {
  role: "Lead investor" | "Investor representative" | "Kori release officer";
  label: string;
  address: string;
  weight: number;
};

export type DemoDeal = {
  id: DemoDealId;
  title: string;
  startupName: string;
  location: string;
  sector: string;
  roomTitle: string;
  roomId: string;
  milestone: string;
  description: string;
  contractId: string;
  deploymentTransaction: string;
  scenario: "Ready for evidence" | "Open funding" | "Deadline refund";
  startup: string;
  fundManager: string;
  releaseAuthority: string;
  knownContributors: readonly string[];
  releaseSigners: readonly DemoReleaseSigner[];
};

const READ_SOURCE = "GABM3A6KELVDZ7ZW37FCU6JVDK3I3MKQSIIIOZH6DXKFX7OAHDK3PCG7";

const RELEASE_AUTHORITY =
  "GD2TZUYYRP2RN5KOWN2NFNVSHYZR26UYHA2ADEF5BYDSI3BAKVHOY7RB";
const FADJIAH = "GB3ON5BVTZWFAECLLXY53AHJV63SNOXDXKATZ4RSOLOSVNANY3ECDNGP";
const LIONEL = "GDTMTVD7IMBV5MVYDA42KM7R4DZXOPNKH6Y7RUKJN3DXNSOBUS6CKEUQ";
const KORI_RELEASE_OFFICER =
  "GCERD6HEUD3RZ6VQBLDBLFIN3KMB3KKA7W7NQPAXX57AGRCZCWYSITRJ";
const INVESTOR_A = "GDDWS25MKDXHW3FNRSKGT4G6LODA7UL5F7NDXDI4LS7HCSABVFYLRBTF";
const INVESTOR_B = "GDX5SVXQL5DXHJ3R5ZVDHAN7N5CY2Y74N4MX67OHQIJIOM2SXQBQPC2V";

export const KORI_MVP_RELEASE_SIGNERS = [
  {
    role: "Lead investor",
    label: "Fadjiah",
    address: FADJIAH,
    weight: 1,
  },
  {
    role: "Investor representative",
    label: "Lionel",
    address: LIONEL,
    weight: 2,
  },
  {
    role: "Kori release officer",
    label: "Kori recovery",
    address: KORI_RELEASE_OFFICER,
    weight: 1,
  },
] as const satisfies readonly DemoReleaseSigner[];

export const KORI_MVP_RELEASE_THRESHOLD = 3;

export const KORI_DEMO_DEALS = [
  {
    id: "kigali-transport",
    title: "Logistic Transport Kigali",
    startupName: "Kigali Transit Labs",
    location: "Kigali, Rwanda",
    sector: "Mobility & logistics",
    roomTitle: "Off-take Agreement & Proof of Revenue",
    roomId: "KGL-TRANSPORT-001",
    milestone: "Validate the signed off-take agreement and first revenue proof.",
    description:
      "A collaborative diligence case prepared for the complete evidence, approval and release demonstration.",
    contractId:
      process.env.NEXT_PUBLIC_STELLAR_KIGALI_ESCROW_ID?.trim() ||
      "CC3XSKZRZU773NVC7XXO2FVKN3GGPD63OX3BBWAOQCFJYKMUTNONHHGL",
    deploymentTransaction:
      "747335d4c96bd670449d0b516c722205174b7f5492b94b24bfd72f397351a177",
    scenario: "Ready for evidence",
    startup: LIONEL,
    fundManager: FADJIAH,
    releaseAuthority: RELEASE_AUTHORITY,
    knownContributors: [INVESTOR_B],
    releaseSigners: KORI_MVP_RELEASE_SIGNERS,
  },
  {
    id: "kingston-solar",
    title: "Solar Grid Kingston",
    startupName: "Kingston Community Solar",
    location: "Kingston, Jamaica",
    sector: "Climate infrastructure",
    roomTitle: "Installation Readiness & Grid Connection",
    roomId: "KIN-SOLAR-001",
    milestone: "Confirm site readiness and the utility interconnection package.",
    description:
      "An open funding case that any Testnet USDC holder can contribute to through Freighter.",
    contractId:
      process.env.NEXT_PUBLIC_STELLAR_KINGSTON_ESCROW_ID?.trim() ||
      "CDIO5OOUS53NHT4IO6IVZDDK5VILKAKPTCVWFQDFPDYJSWIYESLOT75W",
    deploymentTransaction:
      "13c4d7ecaa71686d9c09b6c085bd7ba2a805c556fb4c3042fbea526052f6a797",
    scenario: "Open funding",
    startup: "GB6SZQEQMUF3D3VRMZAHLBMUUVGLRP42MSJK4LIDQFJGXBF2XHKTNRSC",
    fundManager: FADJIAH,
    releaseAuthority: RELEASE_AUTHORITY,
    knownContributors: [INVESTOR_A],
    releaseSigners: KORI_MVP_RELEASE_SIGNERS,
  },
  {
    id: "accra-agro",
    title: "Agro-processing Accra",
    startupName: "Accra Harvest Works",
    location: "Accra, Ghana",
    sector: "Food systems",
    roomTitle: "Equipment Commissioning & Production",
    roomId: "ACC-AGRO-001",
    milestone: "Confirm equipment commissioning and the first production batch.",
    description:
      "A deliberately underfunded case used to demonstrate permissionless deadline refunds.",
    contractId:
      process.env.NEXT_PUBLIC_STELLAR_ACCRA_ESCROW_ID?.trim() ||
      "CAVXSTQ53IEPBQMTPXQHPWE56KYHRK3VTOPHYT5DR4ZRCZUP7I4SSBQY",
    deploymentTransaction:
      "268b5570e5b120ca44a82fbb9486cbe1ecf64f7fe3e035843989b77e40a0ae37",
    scenario: "Deadline refund",
    startup: "GBLGQLHVEFZUSXGMALCE65MYEL3YJHJY2C3MYI6R7NQGOESPPO7HJFXB",
    fundManager: FADJIAH,
    releaseAuthority: RELEASE_AUTHORITY,
    knownContributors: [INVESTOR_A],
    releaseSigners: KORI_MVP_RELEASE_SIGNERS,
  },
] as const satisfies readonly DemoDeal[];

export const KORI_DEMO_DEAL = KORI_DEMO_DEALS[0];
export const KORI_DEMO_READ_SOURCE = READ_SOURCE;

export const KORI_NAMED_DEMO_INVESTORS = [
  { label: "Lionel", address: LIONEL },
  { label: "Fadjiah", address: FADJIAH },
  { label: "Investor A", address: INVESTOR_A },
  { label: "Investor B", address: INVESTOR_B },
] as const;

export function getDemoDeal(id: DemoDealId) {
  const deal = KORI_DEMO_DEALS.find((candidate) => candidate.id === id);
  if (!deal) throw new Error(`Unknown Kori demo deal: ${id}`);
  return deal;
}

export function getNamedDemoInvestor(address: string | null) {
  if (!address) return null;
  return (
    KORI_NAMED_DEMO_INVESTORS.find((investor) => investor.address === address) ??
    null
  );
}

export function shortStellarAddress(value: string) {
  return value.length > 14 ? `${value.slice(0, 7)}…${value.slice(-7)}` : value;
}
