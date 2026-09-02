"use client";

import {
  getAddress,
  getNetworkDetails,
  isConnected,
  setAllowed,
  signTransaction,
} from "@stellar/freighter-api";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  KORI_DEMO_DEAL,
  STELLAR_TESTNET,
  getDemoInvestor,
  shortStellarAddress,
} from "@/lib/stellar/demo-config";
import {
  type DealSnapshot,
  prepareFundingXdr,
  readDealSnapshot,
  submitFundingXdr,
} from "@/lib/stellar/client";
import { formatUsdc, parseUsdc } from "@/lib/stellar/usdc";

type FundingStage =
  | "idle"
  | "connecting"
  | "simulating"
  | "signing"
  | "submitting"
  | "confirming"
  | "success"
  | "error";

const busyStages = new Set<FundingStage>([
  "connecting",
  "simulating",
  "signing",
  "submitting",
  "confirming",
]);

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "The Stellar request failed. Please try again.";
}

function formatDeadline(timestamp: number) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Guadeloupe",
  }).format(new Date(timestamp * 1_000));
}

export function DealFundingPanel() {
  const [snapshot, setSnapshot] = useState<DealSnapshot | null>(null);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [amount, setAmount] = useState("1");
  const [stage, setStage] = useState<FundingStage>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [confirmedLedger, setConfirmedLedger] = useState<number | null>(null);

  const refreshSnapshot = useCallback(async () => {
    try {
      const current = await readDealSnapshot();
      setSnapshot(current);
      setSnapshotError(null);
    } catch (error) {
      setSnapshotError(errorMessage(error));
    }
  }, []);

  useEffect(() => {
    let active = true;

    readDealSnapshot()
      .then((current) => {
        if (!active) return;
        setSnapshot(current);
        setSnapshotError(null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setSnapshotError(errorMessage(error));
      });

    return () => {
      active = false;
    };
  }, []);

  const investor = getDemoInvestor(walletAddress);
  const isBusy = busyStages.has(stage);
  const remaining = snapshot
    ? snapshot.targetBaseUnits - snapshot.totalFundedBaseUnits
    : null;
  const fundingOpen = snapshot?.state === "FundingOpen";
  const canFund = Boolean(investor && fundingOpen && !isBusy);

  const statusLabel = useMemo(() => {
    const labels: Record<FundingStage, string> = {
      idle: "Ready",
      connecting: "Connecting wallet",
      simulating: "Simulating contract call",
      signing: "Waiting for signature",
      submitting: "Submitting transaction",
      confirming: "Waiting for ledger confirmation",
      success: "Confirmed on Testnet",
      error: "Action required",
    };

    return labels[stage];
  }, [stage]);

  async function connectWallet() {
    setStage("connecting");
    setMessage(null);
    setTransactionHash(null);
    setConfirmedLedger(null);

    try {
      const extension = await isConnected();
      if (extension.error || !extension.isConnected) {
        throw new Error("Install and unlock the Freighter wallet extension.");
      }

      const permission = await setAllowed();
      if (permission.error || !permission.isAllowed) {
        throw new Error("Freighter access was not approved.");
      }

      const [addressResult, networkResult] = await Promise.all([
        getAddress(),
        getNetworkDetails(),
      ]);

      if (addressResult.error || !addressResult.address) {
        throw new Error("Freighter did not return an active account.");
      }

      if (
        networkResult.error ||
        networkResult.networkPassphrase !== STELLAR_TESTNET.networkPassphrase
      ) {
        throw new Error("Switch Freighter to Stellar Testnet and reconnect.");
      }

      setWalletAddress(addressResult.address);
      setStage("idle");
      setMessage(
        getDemoInvestor(addressResult.address)
          ? "Demo investor connected."
          : "This account is not an approved Testnet demo investor.",
      );
    } catch (error) {
      setStage("error");
      setMessage(errorMessage(error));
    }
  }

  async function fundDeal() {
    if (!walletAddress || !investor) {
      setStage("error");
      setMessage("Connect an approved Testnet demo investor before funding.");
      return;
    }

    setMessage(null);
    setTransactionHash(null);
    setConfirmedLedger(null);

    try {
      const baseUnits = parseUsdc(amount);

      if (remaining !== null && baseUnits > remaining) {
        throw new Error(
          `The remaining deal capacity is ${formatUsdc(remaining)} USDC.`,
        );
      }

      setStage("simulating");
      const transactionXdr = await prepareFundingXdr(walletAddress, baseUnits);

      setStage("signing");
      const signed = await signTransaction(transactionXdr, {
        address: walletAddress,
        networkPassphrase: STELLAR_TESTNET.networkPassphrase,
      });

      if (signed.error || !signed.signedTxXdr) {
        throw new Error("Freighter did not sign the funding transaction.");
      }

      if (signed.signerAddress !== walletAddress) {
        throw new Error("Freighter signed with a different account.");
      }

      setStage("submitting");
      const receipt = await submitFundingXdr(signed.signedTxXdr, (hash) => {
        setTransactionHash(hash);
        setStage("confirming");
      });

      setTransactionHash(receipt.hash);
      setConfirmedLedger(receipt.ledger);
      setStage("success");
      setMessage(
        `${formatUsdc(baseUnits)} USDC funded by ${investor.label}.`,
      );
      await refreshSnapshot();
    } catch (error) {
      setStage("error");
      setMessage(errorMessage(error));
    }
  }

  return (
    <section id="invest" className="stellar-funding-panel" aria-live="polite">
      <header className="stellar-funding-header">
        <div>
          <p className="stellar-eyebrow">LIVE STELLAR TESTNET</p>
          <h2>Fund the Kori demo escrow</h2>
          <p>
            A signed Soroban call transfers USDC atomically from the connected
            investor to this deal-specific escrow.
          </p>
        </div>
        <span className={`stellar-stage stellar-stage--${stage}`}>
          {statusLabel}
        </span>
      </header>

      <div className="stellar-funding-grid">
        <dl className="stellar-deal-facts">
          <div>
            <dt>Contract</dt>
            <dd>
              <a
                href={`${STELLAR_TESTNET.explorerUrl}/contract/${KORI_DEMO_DEAL.contractId}`}
                target="_blank"
                rel="noreferrer"
              >
                {shortStellarAddress(KORI_DEMO_DEAL.contractId)}
              </a>
            </dd>
          </div>
          <div>
            <dt>On-chain state</dt>
            <dd>{snapshot?.state ?? (snapshotError ? "Unavailable" : "Loading")}</dd>
          </div>
          <div>
            <dt>Funded</dt>
            <dd>
              {snapshot
                ? `${formatUsdc(snapshot.totalFundedBaseUnits)} / ${formatUsdc(snapshot.targetBaseUnits)} USDC`
                : "—"}
            </dd>
          </div>
          <div>
            <dt>Funding deadline</dt>
            <dd>
              {formatDeadline(
                snapshot?.fundingDeadline ?? KORI_DEMO_DEAL.fundingDeadline,
              )}
            </dd>
          </div>
        </dl>

        <div className="stellar-funding-action">
          <div className="stellar-wallet-row">
            <div>
              <span>Wallet</span>
              <strong>
                {walletAddress
                  ? `${investor?.label ?? "Unsupported account"} · ${shortStellarAddress(walletAddress)}`
                  : "Not connected"}
              </strong>
            </div>
            <button
              className="stellar-secondary-button"
              type="button"
              onClick={connectWallet}
              disabled={isBusy}
            >
              {walletAddress ? "Reconnect" : "Connect Freighter"}
            </button>
          </div>

          <label className="stellar-amount-field">
            <span>Contribution amount</span>
            <span className="stellar-amount-control">
              <input
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                disabled={isBusy}
                aria-label="Contribution amount in USDC"
              />
              <strong>USDC</strong>
            </span>
          </label>

          <button
            className="stellar-primary-button"
            type="button"
            onClick={fundDeal}
            disabled={!canFund}
          >
            Simulate, sign and fund
          </button>

          {!investor && walletAddress ? (
            <p className="stellar-warning">
              Select one of the approved Testnet-only demo accounts in
              Freighter.
            </p>
          ) : null}

          {snapshotError ? (
            <p className="stellar-warning">On-chain read: {snapshotError}</p>
          ) : null}

          {message ? (
            <p className={stage === "error" ? "stellar-error" : "stellar-message"}>
              {message}
            </p>
          ) : null}

          {transactionHash ? (
            <p className="stellar-transaction-result">
              Transaction: {" "}
              <a
                href={`${STELLAR_TESTNET.explorerUrl}/tx/${transactionHash}`}
                target="_blank"
                rel="noreferrer"
              >
                {shortStellarAddress(transactionHash)}
              </a>
              {confirmedLedger ? ` · ledger ${confirmedLedger}` : " · pending"}
            </p>
          ) : null}
        </div>
      </div>

      <footer className="stellar-funding-footer">
        Testnet demonstration only. Freighter displays and signs the complete
        transaction; Kori never receives the wallet secret key.
      </footer>
    </section>
  );
}
