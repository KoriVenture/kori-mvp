import { DealLifecycleWorkspace } from "@/components/stellar/DealLifecycleWorkspace";

export const metadata = {
  title: "Stellar Testnet demo · Kori",
  description: "Run the complete Kori deal lifecycle on Stellar Testnet.",
};

export default function StellarDemoPage() {
  return (
    <main className="stellar-demo-page">
      <header className="stellar-demo-intro">
        <p>KORI · BLOCKCHAIN DEMONSTRATION</p>
        <h1>Three SPVs. One complete on-chain lifecycle.</h1>
        <span>
          Fund, anchor evidence, approve, co-sign a release, or exercise the
          deterministic refund path without relying on mock blockchain data.
        </span>
      </header>
      <DealLifecycleWorkspace />
    </main>
  );
}
