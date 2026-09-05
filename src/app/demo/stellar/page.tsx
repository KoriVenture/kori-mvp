import { DealFundingPanel } from "@/components/stellar/DealFundingPanel";

export const metadata = {
  title: "Stellar Testnet demo · Kori",
  description: "Fund the Kori DealEscrow with signed Testnet USDC.",
};

export default function StellarDemoPage() {
  return (
    <main className="stellar-demo-page">
      <header className="stellar-demo-intro">
        <p>KORI · BLOCKCHAIN DEMONSTRATION</p>
        <h1>Investor funding on Stellar</h1>
        <span>
          This isolated route exposes the same live funding component used in
          the authenticated investor dashboard.
        </span>
      </header>
      <DealFundingPanel />
    </main>
  );
}
