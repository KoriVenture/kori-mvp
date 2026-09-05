export const STELLAR_TESTNET = {
  network: "TESTNET",
  networkPassphrase: "Test SDF Network ; September 2015",
  rpcUrl:
    process.env.NEXT_PUBLIC_STELLAR_RPC_URL?.trim() ||
    "https://soroban-testnet.stellar.org",
  explorerUrl: "https://stellar.expert/explorer/testnet",
} as const;

export const KORI_DEMO_DEAL = {
  contractId:
    process.env.NEXT_PUBLIC_STELLAR_DEAL_ESCROW_ID?.trim() ||
    "CA4RSBPJUOOJCHGO77XEL3RURRPWOF6PPEU7CJXASYOL5P5Q7DDEFSYY",
  usdcSac:
    "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  targetBaseUnits: 50_000_000n,
  fundingDeadline: 1_788_926_340,
  releaseDeadline: 1_789_531_140,
  readSource:
    "GABM3A6KELVDZ7ZW37FCU6JVDK3I3MKQSIIIOZH6DXKFX7OAHDK3PCG7",
  deploymentTransaction:
    "80d52c6a2d20a42994df7d4c45e097a252b6193766a1ebaa262723b10f88b311",
} as const;

// Friendly labels for shared demo wallets. This list is not an allowlist:
// the Testnet contract accepts funding from any authenticated investor wallet.
export const KORI_NAMED_DEMO_INVESTORS = [
  {
    label: "Lionel Demo",
    address: "GDTMTVD7IMBV5MVYDA42KM7R4DZXOPNKH6Y7RUKJN3DXNSOBUS6CKEUQ",
  },
  {
    label: "Investor A",
    address: "GDDWS25MKDXHW3FNRSKGT4G6LODA7UL5F7NDXDI4LS7HCSABVFYLRBTF",
  },
  {
    label: "Investor B",
    address: "GDX5SVXQL5DXHJ3R5ZVDHAN7N5CY2Y74N4MX67OHQIJIOM2SXQBQPC2V",
  },
] as const;

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
