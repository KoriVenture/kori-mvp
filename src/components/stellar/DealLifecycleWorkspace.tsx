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
  type DemoDealId,
  KORI_DEMO_DEALS,
  KORI_MVP_RELEASE_THRESHOLD,
  STELLAR_TESTNET,
  STELLAR_TESTNET_USDC,
  getDemoDeal,
  getNamedDemoInvestor,
  shortStellarAddress,
} from "@/lib/stellar/demo-config";
import {
  type DealSnapshot,
  type InvestorPosition,
  type TransactionReceipt,
  prepareApprovalXdr,
  prepareClaimRefundXdr,
  prepareEvidenceXdr,
  prepareFundingXdr,
  prepareOpenRefundsXdr,
  prepareReleaseXdr,
  readDealSnapshot,
  readInvestorPosition,
  submitTransactionXdr,
  validateReleaseTransactionXdr,
  validateSignedTransactionMatchesPreparation,
  verifyReleaseSignatures,
} from "@/lib/stellar/client";
import {
  type PreparedEvidence,
  prepareEvidenceManifest,
  verifyEvidenceManifest,
} from "@/lib/stellar/evidence";
import { formatUsdc, parseUsdc } from "@/lib/stellar/usdc";

type ActionStage =
  | "idle"
  | "connecting"
  | "preparing"
  | "signing"
  | "submitting"
  | "confirming"
  | "success"
  | "error";

type ReleasePackage = {
  schemaVersion: 1;
  dealId: DemoDealId;
  contractId: string;
  networkPassphrase: string;
  createdAt: string;
  xdr: string;
};

type Activity = TransactionReceipt & { label: string };

const BUSY_STAGES = new Set<ActionStage>([
  "connecting",
  "preparing",
  "signing",
  "submitting",
  "confirming",
]);

const JSON_IMPORT_MAX_BYTES = 256 * 1024;

const STATE_LABELS: Record<string, string> = {
  FundingOpen: "Funding open",
  Funded: "Fully funded",
  EvidenceSubmitted: "Evidence anchored",
  Approved: "Milestone approved",
  Released: "Funds released",
  Refundable: "Refunds open",
  Refunded: "Refunded",
};

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "The Stellar request failed. Please try again.";
}

function formatDeadline(timestamp: number | undefined) {
  if (!timestamp) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Guadeloupe",
  }).format(new Date(timestamp * 1_000));
}

function formatTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "America/Guadeloupe",
  }).format(new Date(timestamp * 1_000));
}

function evidenceStorageKey(contractId: string, hashHex: string) {
  return `kori:evidence:${contractId}:${hashHex.toLowerCase()}`;
}

function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function parseReleasePackage(raw: string, dealId: DemoDealId, contractId: string) {
  const value = JSON.parse(raw) as Partial<ReleasePackage>;
  if (
    value.schemaVersion !== 1 ||
    value.dealId !== dealId ||
    value.contractId !== contractId ||
    value.networkPassphrase !== STELLAR_TESTNET.networkPassphrase ||
    typeof value.createdAt !== "string" ||
    Number.isNaN(Date.parse(value.createdAt)) ||
    typeof value.xdr !== "string" ||
    value.xdr.length > JSON_IMPORT_MAX_BYTES
  ) {
    throw new Error("This release package does not match the selected Testnet deal.");
  }
  return value as ReleasePackage;
}

function lifecycleStepState(
  state: DealSnapshot["state"] | undefined,
  step: "funding" | "evidence" | "approval" | "release",
) {
  if (!state) return "pending";
  const rank: Record<DealSnapshot["state"], number> = {
    FundingOpen: 0,
    Funded: 1,
    EvidenceSubmitted: 2,
    Approved: 3,
    Released: 4,
    Refundable: -1,
    Refunded: -1,
  };
  const target = { funding: 0, evidence: 1, approval: 2, release: 3 }[step];
  if (rank[state] < 0) return "alternate";
  if (rank[state] > target) return "complete";
  if (rank[state] === target) return "current";
  return "pending";
}

export function DealLifecycleWorkspace({
  appPersona = "Public demo",
}: {
  appPersona?: string;
}) {
  const [selectedDealId, setSelectedDealId] =
    useState<DemoDealId>("kigali-transport");
  const deal = getDemoDeal(selectedDealId);
  const [snapshot, setSnapshot] = useState<DealSnapshot | null>(null);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [amount, setAmount] = useState("1");
  const [statement, setStatement] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [preparedEvidence, setPreparedEvidence] =
    useState<PreparedEvidence | null>(null);
  const [reviewedEvidence, setReviewedEvidence] =
    useState<PreparedEvidence | null>(null);
  const [releasePackage, setReleasePackage] =
    useState<ReleasePackage | null>(null);
  const [refundInvestor, setRefundInvestor] = useState<string>(
    deal.knownContributors[0] ?? "",
  );
  const [investorPosition, setInvestorPosition] =
    useState<InvestorPosition | null>(null);
  const [stage, setStage] = useState<ActionStage>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState("Ready");
  const [activities, setActivities] = useState<Activity[]>([]);

  const isBusy = BUSY_STAGES.has(stage);
  const walletName = getNamedDemoInvestor(walletAddress);
  const configurationMatches = Boolean(
    snapshot &&
      snapshot.contractId === deal.contractId &&
      snapshot.asset === STELLAR_TESTNET_USDC.sacAddress &&
      snapshot.startup === deal.startup &&
      snapshot.fundManager === deal.fundManager &&
      snapshot.releaseAuthority === deal.releaseAuthority,
  );
  const remaining = snapshot
    ? snapshot.targetBaseUnits - snapshot.totalFundedBaseUnits
    : null;
  const deadlinePassed = snapshot
    ? snapshot.observedAtTimestamp >=
      (snapshot.state === "FundingOpen"
        ? snapshot.fundingDeadline
        : snapshot.releaseDeadline)
    : false;
  const refundEligible = Boolean(
    snapshot &&
      (snapshot.state === "Refundable" ||
        snapshot.state === "Refunded" ||
        deadlinePassed),
  );

  const walletRoles = useMemo(() => {
    if (!walletAddress || !snapshot) return [];
    const roles: string[] = [];
    if (walletAddress === snapshot.startup) roles.push("Startup founder");
    if (walletAddress === snapshot.fundManager) roles.push("Fund Manager");
    const releaseSigner = deal.releaseSigners.find(
      (signer) => signer.address === walletAddress,
    );
    if (releaseSigner) roles.push(releaseSigner.role);
    if ((deal.knownContributors as readonly string[]).includes(walletAddress)) {
      roles.push("Investor");
    }
    if (roles.length === 0) roles.push("Investor / public caller");
    return roles;
  }, [deal.knownContributors, deal.releaseSigners, snapshot, walletAddress]);

  const verifiedReleaseSigners = useMemo(() => {
    if (!releasePackage) return [];
    try {
      return verifyReleaseSignatures(releasePackage.xdr, deal.releaseSigners);
    } catch {
      return [];
    }
  }, [deal.releaseSigners, releasePackage]);
  const signedWeight = verifiedReleaseSigners.reduce(
    (total, signer) => total + signer.weight,
    0,
  );

  const refreshSnapshot = useCallback(async () => {
    try {
      const current = await readDealSnapshot(deal);
      setSnapshot(current);
      setSnapshotError(null);
      return current;
    } catch (error) {
      setSnapshotError(errorMessage(error));
      return null;
    }
  }, [deal]);

  useEffect(() => {
    let active = true;
    readDealSnapshot(deal)
      .then((current) => {
        if (!active) return;
        setSnapshot(current);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setSnapshotError(errorMessage(error));
      });

    return () => {
      active = false;
    };
  }, [deal]);

  useEffect(() => {
    if (!snapshot?.evidence) return;
    const raw = localStorage.getItem(
      evidenceStorageKey(deal.contractId, snapshot.evidence.hashHex),
    );
    if (!raw) return;
    try {
      const value: unknown = JSON.parse(raw);
      void verifyEvidenceManifest(value, snapshot.evidence.hashHex)
        .then(setReviewedEvidence)
        .catch(() => {
          localStorage.removeItem(
            evidenceStorageKey(deal.contractId, snapshot.evidence!.hashHex),
          );
        });
    } catch {
      localStorage.removeItem(
        evidenceStorageKey(deal.contractId, snapshot.evidence.hashHex),
      );
    }
  }, [deal.contractId, snapshot?.evidence]);

  useEffect(() => {
    if (!snapshot || !refundInvestor) return;
    let active = true;
    readInvestorPosition(deal, refundInvestor)
      .then((position) => {
        if (active) setInvestorPosition(position);
      })
      .catch(() => {
        if (active) setInvestorPosition(null);
      });
    return () => {
      active = false;
    };
  }, [deal, refundInvestor, snapshot]);

  function beginAction(label: string, nextStage: ActionStage = "preparing") {
    setActiveAction(label);
    setStage(nextStage);
    setMessage(null);
  }

  function selectDeal(id: DemoDealId) {
    if (id === deal.id || isBusy) return;
    const nextDeal = getDemoDeal(id);
    setSelectedDealId(id);
    setSnapshot(null);
    setSnapshotError(null);
    setPreparedEvidence(null);
    setReviewedEvidence(null);
    setReleasePackage(null);
    setStatement("");
    setEvidenceFiles([]);
    setRefundInvestor(nextDeal.knownContributors[0] ?? "");
    setInvestorPosition(null);
    setStage("idle");
    setMessage(null);
    setActiveAction("Ready");
  }

  async function connectWallet() {
    beginAction("Connect Freighter", "connecting");
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
      setStage("success");
      setMessage("Freighter is connected to Stellar Testnet.");
    } catch (error) {
      setStage("error");
      setMessage(errorMessage(error));
    }
  }

  async function executeWalletAction(
    label: string,
    prepare: (wallet: string) => Promise<string>,
    successMessage: string,
  ): Promise<boolean> {
    if (!walletAddress) {
      setStage("error");
      setActiveAction(label);
      setMessage("Connect a Stellar Testnet wallet first.");
      return false;
    }
    beginAction(label);
    try {
      const transactionXdr = await prepare(walletAddress);
      setStage("signing");
      const signed = await signTransaction(transactionXdr, {
        address: walletAddress,
        networkPassphrase: STELLAR_TESTNET.networkPassphrase,
      });
      if (signed.error || !signed.signedTxXdr) {
        throw new Error("Freighter did not sign the transaction.");
      }
      validateSignedTransactionMatchesPreparation(
        transactionXdr,
        signed.signedTxXdr,
      );
      if (signed.signerAddress !== walletAddress) {
        throw new Error("Freighter signed with a different account.");
      }

      setStage("submitting");
      const receipt = await submitTransactionXdr(signed.signedTxXdr, () => {
        setStage("confirming");
      });
      setActivities((current) => [{ ...receipt, label }, ...current].slice(0, 8));
      setStage("success");
      setMessage(successMessage);
      await refreshSnapshot();
      return true;
    } catch (error) {
      setStage("error");
      setMessage(errorMessage(error));
      return false;
    }
  }

  async function fundDeal() {
    let baseUnits: bigint;
    try {
      baseUnits = parseUsdc(amount);
      if (remaining !== null && baseUnits > remaining) {
        throw new Error(`Only ${formatUsdc(remaining)} USDC remains to fund.`);
      }
    } catch (error) {
      setStage("error");
      setActiveAction("Fund deal");
      setMessage(errorMessage(error));
      return;
    }
    const succeeded = await executeWalletAction(
      "Fund deal",
      (wallet) => prepareFundingXdr(wallet, baseUnits, deal),
      `${formatUsdc(baseUnits)} USDC was confirmed on Stellar Testnet.`,
    );
    if (succeeded && walletAddress) setRefundInvestor(walletAddress);
  }

  async function buildEvidenceManifest() {
    if (!walletAddress || walletAddress !== snapshot?.startup) {
      setStage("error");
      setActiveAction("Build evidence manifest");
      setMessage("Connect the startup wallet configured for this deal.");
      return;
    }
    beginAction("Build evidence manifest");
    try {
      const prepared = await prepareEvidenceManifest({
        dealId: deal.id,
        contractId: deal.contractId,
        milestone: deal.milestone,
        submitter: walletAddress,
        statement,
        files: evidenceFiles,
      });
      setPreparedEvidence(prepared);
      localStorage.setItem(
        evidenceStorageKey(deal.contractId, prepared.hashHex),
        prepared.canonicalJson,
      );
      setStage("success");
      setMessage("Canonical evidence manifest created. Review it before anchoring its hash.");
    } catch (error) {
      setStage("error");
      setMessage(errorMessage(error));
    }
  }

  async function anchorEvidence() {
    if (!preparedEvidence) return;
    const succeeded = await executeWalletAction(
      "Anchor evidence",
      (wallet) => prepareEvidenceXdr(deal, wallet, preparedEvidence.hashHex),
      `Evidence ${preparedEvidence.hashHex.slice(0, 12)}… was anchored on-chain.`,
    );
    if (succeeded) setReviewedEvidence(preparedEvidence);
  }

  async function importEvidence(file: File | null) {
    if (!file || !snapshot?.evidence) return;
    beginAction("Verify evidence manifest");
    try {
      if (file.size > JSON_IMPORT_MAX_BYTES) {
        throw new Error("The evidence manifest JSON must be 256 KB or smaller.");
      }
      const parsed = JSON.parse(await file.text()) as unknown;
      const verified = await verifyEvidenceManifest(
        parsed,
        snapshot.evidence.hashHex,
      );
      if (
        verified.manifest.dealId !== deal.id ||
        verified.manifest.contractId !== deal.contractId ||
        verified.manifest.milestone !== deal.milestone ||
        verified.manifest.submitter !== snapshot.startup
      ) {
        throw new Error(
          "This evidence manifest does not match the selected deal, milestone, or startup.",
        );
      }
      setReviewedEvidence(verified);
      localStorage.setItem(
        evidenceStorageKey(deal.contractId, verified.hashHex),
        verified.canonicalJson,
      );
      setStage("success");
      setMessage("Manifest integrity matches the evidence hash anchored on-chain.");
    } catch (error) {
      setStage("error");
      setMessage(errorMessage(error));
    }
  }

  async function approveEvidence() {
    if (!snapshot?.evidence) return;
    await executeWalletAction(
      "Approve milestone",
      (wallet) =>
        prepareApprovalXdr(
          deal,
          wallet,
          snapshot.evidence!.hashHex,
          snapshot.evidence!.version,
        ),
      "The Fund Manager approval was confirmed on-chain.",
    );
  }

  async function prepareReleasePackage() {
    if (!configurationMatches) {
      setStage("error");
      setActiveAction("Prepare release package");
      setMessage("The selected contract does not match the reviewed demo configuration.");
      return;
    }
    if (!snapshot?.approval) return;
    beginAction("Prepare release package");
    try {
      const xdr = await prepareReleaseXdr(deal, snapshot);
      setReleasePackage({
        schemaVersion: 1,
        dealId: deal.id,
        contractId: deal.contractId,
        networkPassphrase: STELLAR_TESTNET.networkPassphrase,
        createdAt: new Date().toISOString(),
        xdr,
      });
      setStage("success");
      setMessage("Release package prepared. Collect one valid signer pair.");
    } catch (error) {
      setStage("error");
      setMessage(errorMessage(error));
    }
  }

  async function signReleasePackage() {
    if (!walletAddress || !releasePackage) return;
    if (!configurationMatches) {
      setStage("error");
      setActiveAction("Sign release");
      setMessage("The selected contract does not match the reviewed demo configuration.");
      return;
    }
    const configuredSigner = deal.releaseSigners.find(
      (signer) => signer.address === walletAddress,
    );
    if (!configuredSigner) {
      setStage("error");
      setActiveAction("Sign release");
      setMessage("The connected wallet is not a signer of this release account.");
      return;
    }
    beginAction("Sign release", "signing");
    try {
      if (!snapshot) throw new Error("Refresh the on-chain deal before signing.");
      validateReleaseTransactionXdr(releasePackage.xdr, deal, snapshot);
      const signed = await signTransaction(releasePackage.xdr, {
        address: walletAddress,
        networkPassphrase: STELLAR_TESTNET.networkPassphrase,
      });
      if (signed.error || !signed.signedTxXdr) {
        throw new Error("Freighter did not sign the release package.");
      }
      if (signed.signerAddress !== walletAddress) {
        throw new Error("Freighter signed with a different account.");
      }
      setReleasePackage((current) =>
        current ? { ...current, xdr: signed.signedTxXdr } : current,
      );
      setStage("success");
      setMessage(`${configuredSigner.label} added a verifiable signature.`);
    } catch (error) {
      setStage("error");
      setMessage(errorMessage(error));
    }
  }

  async function importReleasePackage(file: File | null) {
    if (!file) return;
    beginAction("Import release package");
    try {
      if (file.size > JSON_IMPORT_MAX_BYTES) {
        throw new Error("The release package JSON must be 256 KB or smaller.");
      }
      const imported = parseReleasePackage(
        await file.text(),
        deal.id,
        deal.contractId,
      );
      if (!snapshot || !configurationMatches) {
        throw new Error("Refresh and verify the on-chain deal before importing.");
      }
      validateReleaseTransactionXdr(imported.xdr, deal, snapshot);
      setReleasePackage(imported);
      setStage("success");
      setMessage("Release package imported and cryptographic signatures checked.");
    } catch (error) {
      setStage("error");
      setMessage(errorMessage(error));
    }
  }

  async function submitRelease() {
    if (!releasePackage) return;
    if (!configurationMatches) {
      setStage("error");
      setActiveAction("Submit release");
      setMessage("The selected contract does not match the reviewed demo configuration.");
      return;
    }
    if (signedWeight < KORI_MVP_RELEASE_THRESHOLD) {
      setStage("error");
      setActiveAction("Submit release");
      setMessage("The release account signature threshold has not been reached.");
      return;
    }
    beginAction("Submit release", "submitting");
    try {
      if (!snapshot) throw new Error("Refresh the on-chain deal before submitting.");
      validateReleaseTransactionXdr(releasePackage.xdr, deal, snapshot);
      const receipt = await submitTransactionXdr(releasePackage.xdr, () => {
        setStage("confirming");
      });
      setActivities((current) => [
        { ...receipt, label: "Release funds" },
        ...current,
      ].slice(0, 8));
      setStage("success");
      setMessage("The approved USDC was released to the startup on Testnet.");
      await refreshSnapshot();
    } catch (error) {
      setStage("error");
      setMessage(errorMessage(error));
    }
  }

  async function copyReleasePackage() {
    if (!releasePackage) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(releasePackage, null, 2));
      setMessage("Release package copied. Send it to the next signer.");
    } catch {
      downloadJson(`${deal.id}-release-package.json`, releasePackage);
      setMessage("Clipboard access was unavailable, so the package was downloaded.");
    }
  }

  const evidenceMatches = Boolean(
    snapshot?.evidence &&
      reviewedEvidence?.hashHex.toLowerCase() ===
        snapshot.evidence.hashHex.toLowerCase(),
  );
  const canFund = Boolean(
    configurationMatches &&
      walletAddress &&
      snapshot?.state === "FundingOpen" &&
      !deadlinePassed &&
      !isBusy,
  );
  const canBuildEvidence = Boolean(
    configurationMatches &&
      walletAddress === snapshot?.startup &&
      (snapshot?.state === "Funded" || snapshot?.state === "EvidenceSubmitted") &&
      !isBusy,
  );
  const canAnchorEvidence = Boolean(canBuildEvidence && preparedEvidence);
  const canApprove = Boolean(
    configurationMatches &&
      walletAddress === snapshot?.fundManager &&
      snapshot?.state === "EvidenceSubmitted" &&
      evidenceMatches &&
      !isBusy,
  );
  const canOpenRefunds = Boolean(
    configurationMatches &&
      walletAddress &&
      deadlinePassed &&
      snapshot &&
      !["Released", "Refundable", "Refunded"].includes(snapshot.state) &&
      !isBusy,
  );
  const canClaimRefund = Boolean(
    configurationMatches &&
      walletAddress &&
      refundInvestor &&
      refundEligible &&
      investorPosition &&
      investorPosition.refundableBaseUnits > 0n &&
      !isBusy,
  );
  const fundingHint = !snapshot
    ? "Waiting for the latest ledger state."
    : !configurationMatches
      ? "Blocked because the contract configuration does not match this SPV."
      : !walletAddress
        ? "Connect any Stellar Testnet wallet to fund this deal."
        : snapshot.state !== "FundingOpen"
          ? `Unavailable while the on-chain state is ${STATE_LABELS[snapshot.state]}.`
          : deadlinePassed
            ? "The immutable funding deadline has passed."
            : `Ready for this wallet. Remaining capacity: ${formatUsdc(remaining ?? 0n)} USDC.`;
  const evidenceHint = !snapshot
    ? "Waiting for the latest ledger state."
    : !["Funded", "EvidenceSubmitted"].includes(snapshot.state)
      ? "Available after the escrow reaches its exact funding target."
      : walletAddress !== snapshot.startup
        ? `Switch Freighter to the configured startup wallet ${shortStellarAddress(snapshot.startup)}.`
        : "Ready: build, export, then anchor the canonical source-evidence manifest."
  const approvalHint = !snapshot
    ? "Waiting for the latest ledger state."
    : snapshot.state !== "EvidenceSubmitted"
      ? "Available after the startup anchors an evidence manifest."
      : walletAddress !== snapshot.fundManager
        ? `Switch Freighter to the assigned Fund Manager ${shortStellarAddress(snapshot.fundManager)}.`
        : !evidenceMatches
          ? "Import the exact exported manifest before signing approval."
          : "Ready: the imported manifest matches the current on-chain hash and version.";
  const releaseHint = !snapshot
    ? "Waiting for the latest ledger state."
    : snapshot.state !== "Approved"
      ? "Available after the Fund Manager approval is confirmed on-chain."
      : !releasePackage
        ? "Prepare one exact release package, then collect Fadjiah + Lionel or Kori + Lionel."
        : signedWeight < KORI_MVP_RELEASE_THRESHOLD
          ? `Collect another valid signature. Verified weight: ${signedWeight} / ${KORI_MVP_RELEASE_THRESHOLD}.`
          : "Threshold reached. Any holder of this verified package may submit it before expiry.";
  const refundHint = !snapshot
    ? "Waiting for the latest ledger state."
    : !refundEligible
      ? "Available only after the applicable immutable deadline."
      : !walletAddress
        ? "Connect any Testnet wallet; the caller cannot redirect the refund."
        : investorPosition && investorPosition.refundableBaseUnits > 0n
          ? `Ready to return ${formatUsdc(investorPosition.refundableBaseUnits)} USDC to the selected original investor.`
          : "Select an original contributor with an unclaimed refundable balance.";

  return (
    <section className="stellar-workspace" aria-live="polite">
      <aside className="stellar-deal-picker" aria-label="V1 startup opportunities">
        <p>THREE TESTNET SPVs</p>
        {KORI_DEMO_DEALS.map((candidate) => (
          <button
            className={candidate.id === deal.id ? "active" : ""}
            key={candidate.id}
            onClick={() => selectDeal(candidate.id)}
            disabled={isBusy}
            type="button"
          >
            <strong>{candidate.title}</strong>
            <span>{candidate.location}</span>
            <small>{candidate.scenario}</small>
          </button>
        ))}
        <div className="stellar-demo-boundary">
          <strong>V1 boundary</strong>
          <span>One deployed escrow per SPV. One milestone and one full payout.</span>
        </div>
      </aside>

      <div className="stellar-lifecycle-main">
        <header className="stellar-deal-header">
          <div>
            <p>{deal.sector} · {deal.location}</p>
            <h1>{deal.title}</h1>
            <span>{deal.description}</span>
          </div>
          <a
            href={`${STELLAR_TESTNET.explorerUrl}/contract/${deal.contractId}`}
            target="_blank"
            rel="noreferrer"
          >
            View contract ↗
          </a>
        </header>

        <section className="stellar-scenario-guide" aria-labelledby={`scenario-${deal.id}`}>
          <header>
            <span>SCENARIO TO RUN · {deal.scenario}</span>
            <strong id={`scenario-${deal.id}`}>{deal.guide.goal}</strong>
            <small>Who acts: {deal.guide.actor}</small>
          </header>
          <ol>
            {deal.guide.steps.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ol>
          <p><strong>Expected:</strong> {deal.guide.expectedResult}</p>
        </section>

        <div className="stellar-chain-summary">
          <dl>
            <div><dt>On-chain state</dt><dd>{snapshot ? STATE_LABELS[snapshot.state] : "Loading…"}</dd></div>
            <div><dt>Funded</dt><dd>{snapshot ? `${formatUsdc(snapshot.totalFundedBaseUnits)} / ${formatUsdc(snapshot.targetBaseUnits)} USDC` : "—"}</dd></div>
            <div><dt>Escrow balance</dt><dd>{snapshot ? `${formatUsdc(snapshot.escrowBalanceBaseUnits)} USDC` : "—"}</dd></div>
            <div><dt>Asset</dt><dd>{snapshot ? snapshot.asset === STELLAR_TESTNET_USDC.sacAddress ? "Official Circle Testnet USDC" : "Unexpected asset" : "Loading…"}</dd></div>
          </dl>
          <button type="button" onClick={() => void refreshSnapshot()} disabled={isBusy}>
            Refresh ledger
          </button>
        </div>

        <ol className="stellar-timeline" aria-label="Deal lifecycle">
          {(["funding", "evidence", "approval", "release"] as const).map((step, index) => (
            <li className={lifecycleStepState(snapshot?.state, step)} key={step}>
              <span>{index + 1}</span>
              <strong>{step}</strong>
            </li>
          ))}
          <li className={snapshot && ["Refundable", "Refunded"].includes(snapshot.state) ? "alternate current" : "alternate"}>
            <span>↳</span><strong>refund</strong>
          </li>
        </ol>

        <section className="stellar-wallet-bar">
          <div>
            <span>ACTIVE WALLET</span>
            <strong>
              {walletAddress
                ? `${walletName?.label ?? "Testnet account"} · ${shortStellarAddress(walletAddress)}`
                : "Not connected"}
            </strong>
            <small>
              Platform profile: {appPersona} · On-chain role: {walletRoles.join(" · ") || "connect to resolve"}
            </small>
          </div>
          <button type="button" onClick={connectWallet} disabled={isBusy}>
            {walletAddress ? "Reconnect / switch" : "Connect Freighter"}
          </button>
        </section>

        {snapshotError ? <p className="stellar-alert error">Ledger read failed: {snapshotError}</p> : null}
        {snapshot && !configurationMatches ? <p className="stellar-alert error">Safety stop: this contract does not match the expected Testnet USDC or deal roles. Update the deployment manifest and frontend configuration together.</p> : null}
        {message ? <p className={`stellar-alert ${stage === "error" ? "error" : "success"}`}><strong>{activeAction}:</strong> {message}</p> : null}

        <div className="stellar-action-grid">
          <article id="funding" className="stellar-action-card">
            <header><span>01</span><div><h2>Investor funding</h2><p>Any Testnet wallet may fund while capacity remains.</p></div></header>
            <label>
              <span>Contribution in USDC</span>
              <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" disabled={isBusy} />
            </label>
            <button type="button" onClick={fundDeal} disabled={!canFund}>Sign and fund</button>
            <small className="stellar-action-hint">{fundingHint}</small>
          </article>

          <article id="evidence" className="stellar-action-card">
            <header><span>02</span><div><h2>Founder evidence</h2><p>The configured startup anchors a canonical manifest hash.</p></div></header>
            <label>
              <span>Milestone statement</span>
              <textarea value={statement} onChange={(event) => setStatement(event.target.value)} placeholder={deal.milestone} disabled={!canBuildEvidence} />
            </label>
            <label>
              <span>Source files (hashed locally, not uploaded)</span>
              <input type="file" multiple disabled={!canBuildEvidence} onChange={(event) => setEvidenceFiles(Array.from(event.target.files ?? []))} />
            </label>
            <div className="stellar-button-row">
              <button type="button" onClick={buildEvidenceManifest} disabled={!canBuildEvidence}>Build manifest</button>
              <button type="button" className="secondary" onClick={() => preparedEvidence && downloadJson(`${deal.id}-evidence.json`, preparedEvidence.manifest)} disabled={!preparedEvidence}>Download</button>
            </div>
            {preparedEvidence ? <code>SHA-256 {preparedEvidence.hashHex}</code> : null}
            <button type="button" onClick={anchorEvidence} disabled={!canAnchorEvidence}>Sign and anchor hash</button>
            <small className="stellar-action-hint">{evidenceHint}</small>
          </article>

          <article id="approval" className="stellar-action-card">
            <header><span>03</span><div><h2>Fund Manager approval</h2><p>Review the exact manifest before approving its on-chain version.</p></div></header>
            {snapshot?.evidence ? (
              <dl className="stellar-compact-facts">
                <div><dt>Hash</dt><dd>{shortStellarAddress(snapshot.evidence.hashHex)}</dd></div>
                <div><dt>Version</dt><dd>{snapshot.evidence.version}</dd></div>
                <div><dt>Anchored</dt><dd>{formatTimestamp(snapshot.evidence.submittedAtTimestamp)}</dd></div>
              </dl>
            ) : <p className="stellar-empty">No evidence is anchored yet.</p>}
            <label className="stellar-file-button">
              <span>Import evidence manifest</span>
              <input type="file" accept="application/json,.json" onChange={(event) => void importEvidence(event.target.files?.[0] ?? null)} disabled={!snapshot?.evidence} />
            </label>
            {reviewedEvidence ? <div className="stellar-reviewed-evidence"><strong>Integrity verified</strong><p>{reviewedEvidence.manifest.statement}</p><small>{reviewedEvidence.manifest.files.length} source file hash(es)</small></div> : null}
            <button type="button" onClick={approveEvidence} disabled={!canApprove}>Sign approval</button>
            <small className="stellar-action-hint">{approvalHint}</small>
          </article>

          <article id="release" className="stellar-action-card stellar-action-card--wide">
            <header><span>04</span><div><h2>Weighted release</h2><p>Lionel plus Fadjiah is the normal pair; Lionel plus Kori is recovery. Prepared transactions expire after 15 minutes.</p></div></header>
            <div className="stellar-release-layout">
              <div>
                <dl className="stellar-compact-facts">
                  {deal.releaseSigners.map((signer) => {
                    const signed = verifiedReleaseSigners.some((item) => item.address === signer.address);
                    return <div key={signer.address}><dt>{signer.label} · weight {signer.weight}</dt><dd>{signed ? "Signed ✓" : "Pending"}</dd></div>;
                  })}
                  <div><dt>Verified weight</dt><dd>{signedWeight} / {KORI_MVP_RELEASE_THRESHOLD}</dd></div>
                </dl>
              </div>
              <div className="stellar-release-actions">
                <button type="button" onClick={prepareReleasePackage} disabled={!configurationMatches || snapshot?.state !== "Approved" || isBusy}>Prepare package</button>
                <button type="button" onClick={signReleasePackage} disabled={!configurationMatches || !releasePackage || !walletAddress || isBusy}>Sign with Freighter</button>
                <button type="button" className="secondary" onClick={copyReleasePackage} disabled={!releasePackage}>Copy / export</button>
                <label className="stellar-file-button secondary"><span>Import co-signed package</span><input type="file" accept="application/json,.json" onChange={(event) => void importReleasePackage(event.target.files?.[0] ?? null)} disabled={!configurationMatches} /></label>
                <button type="button" onClick={submitRelease} disabled={!configurationMatches || !releasePackage || signedWeight < KORI_MVP_RELEASE_THRESHOLD || isBusy}>Submit release</button>
              </div>
            </div>
            <small className="stellar-action-hint">{releaseHint}</small>
          </article>

          <article id="refund" className="stellar-action-card stellar-action-card--refund">
            <header><span>↳</span><div><h2>Permissionless refund</h2><p>After the relevant deadline, anyone may return funds to an original investor.</p></div></header>
            <label>
              <span>Investor destination (cannot be redirected)</span>
              <input
                list={`contributors-${deal.id}`}
                value={refundInvestor}
                onChange={(event) => setRefundInvestor(event.target.value.trim())}
                placeholder="Original investor G-address"
              />
              <datalist id={`contributors-${deal.id}`}>
                {deal.knownContributors.map((address) => (
                  <option value={address} key={address}>
                    {getNamedDemoInvestor(address)?.label ?? shortStellarAddress(address)}
                  </option>
                ))}
              </datalist>
            </label>
            <dl className="stellar-compact-facts">
              <div><dt>Contribution</dt><dd>{investorPosition ? `${formatUsdc(investorPosition.contributionBaseUnits)} USDC` : "—"}</dd></div>
              <div><dt>Refundable now</dt><dd>{investorPosition ? `${formatUsdc(investorPosition.refundableBaseUnits)} USDC` : "—"}</dd></div>
              <div><dt>Applicable deadline</dt><dd>{formatDeadline(snapshot?.refundReason === "FundingTargetMissed" || snapshot?.state === "FundingOpen" ? snapshot?.fundingDeadline : snapshot?.releaseDeadline)}</dd></div>
            </dl>
            <div className="stellar-button-row">
              <button type="button" className="secondary" onClick={() => executeWalletAction("Open refunds", (wallet) => prepareOpenRefundsXdr(deal, wallet), "Refunds are open on-chain.")} disabled={!canOpenRefunds}>Open refunds</button>
              <button type="button" onClick={() => executeWalletAction("Claim refund", (wallet) => prepareClaimRefundXdr(deal, wallet, refundInvestor), "The contribution was returned to its original investor address.")} disabled={!canClaimRefund}>Return contribution</button>
            </div>
            <small className="stellar-action-hint">{refundHint}</small>
          </article>
        </div>

        <footer className="stellar-ledger-footer">
          <div><strong>Contract</strong><code>{deal.contractId}</code></div>
          <div><strong>Funding deadline</strong><span>{formatDeadline(snapshot?.fundingDeadline)}</span></div>
          <div><strong>Release deadline</strong><span>{formatDeadline(snapshot?.releaseDeadline)}</span></div>
          {activities.length > 0 ? <section><h2>Confirmed this session</h2>{activities.map((activity) => <a href={`${STELLAR_TESTNET.explorerUrl}/tx/${activity.hash}`} target="_blank" rel="noreferrer" key={activity.hash}>{activity.label} · ledger {activity.ledger} ↗</a>)}</section> : null}
          <p>Testnet only. Freighter signs locally; Kori never receives a wallet secret. Source files remain off-chain and must be shared with the reviewer alongside the exported manifest.</p>
        </footer>
      </div>
    </section>
  );
}
