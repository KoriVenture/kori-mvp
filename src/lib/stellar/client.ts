import {
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";
import { Api, Server } from "@stellar/stellar-sdk/rpc";

import {
  type DemoDeal,
  KORI_DEMO_DEAL,
  KORI_DEMO_READ_SOURCE,
  STELLAR_TESTNET,
  STELLAR_TESTNET_USDC,
} from "./demo-config.ts";

export type DealState =
  | "FundingOpen"
  | "Funded"
  | "EvidenceSubmitted"
  | "Approved"
  | "Released"
  | "Refundable"
  | "Refunded";

export type EvidenceSubmission = {
  hashHex: string;
  version: number;
  submittedAtLedger: number;
  submittedAtTimestamp: number;
};

export type MilestoneApproval = {
  hashHex: string;
  version: number;
  releaseAmountBaseUnits: bigint;
  approvedAtLedger: number;
  approvedAtTimestamp: number;
};

export type DealSnapshot = {
  contractId: string;
  observedAtTimestamp: number;
  state: DealState;
  asset: string;
  startup: string;
  fundManager: string;
  releaseAuthority: string;
  totalFundedBaseUnits: bigint;
  totalReleasedBaseUnits: bigint;
  totalRefundedBaseUnits: bigint;
  escrowBalanceBaseUnits: bigint;
  targetBaseUnits: bigint;
  fundingDeadline: number;
  releaseDeadline: number;
  evidence: EvidenceSubmission | null;
  approval: MilestoneApproval | null;
  refundReason: string | null;
};

export type InvestorPosition = {
  contributionBaseUnits: bigint;
  refundedBaseUnits: bigint;
  refundableBaseUnits: bigint;
};

export type TransactionReceipt = {
  hash: string;
  ledger: number;
  createdAt: number;
};

export type VerifiedReleaseSigner = {
  role: string;
  label: string;
  address: string;
  weight: number;
};

const RELEASE_PACKAGE_MAX_FEE_STROOPS = 10_000_000n;
const RELEASE_PACKAGE_MAX_REMAINING_SECONDS = 20 * 60;

function createServer() {
  return new Server(STELLAR_TESTNET.rpcUrl, { allowHttp: false });
}

function buildInvocation(
  source: Awaited<ReturnType<Server["getAccount"]>>,
  contractId: string,
  method: string,
  args: xdr.ScVal[] = [],
  timeoutSeconds = 300,
) {
  return new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_TESTNET.networkPassphrase,
  })
    .addOperation(new Contract(contractId).call(method, ...args))
    .setTimeout(timeoutSeconds)
    .build();
}

async function simulateValue(
  server: Server,
  source: Awaited<ReturnType<Server["getAccount"]>>,
  contractId: string,
  method: string,
  args: xdr.ScVal[] = [],
) {
  const response = await server.simulateTransaction(
    buildInvocation(source, contractId, method, args),
  );

  if (!Api.isSimulationSuccess(response) || !response.result) {
    const detail = Api.isSimulationError(response)
      ? response.error
      : `No result returned for ${method}.`;
    throw new Error(detail);
  }

  return scValToNative(response.result.retval) as unknown;
}

function bytesToHex(value: unknown) {
  if (!(value instanceof Uint8Array)) {
    throw new Error("The contract returned an invalid evidence hash.");
  }
  return Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hashHexToScVal(hashHex: string) {
  if (!/^[0-9a-f]{64}$/i.test(hashHex)) {
    throw new Error(
      "Evidence hash must be exactly 32 bytes (64 hexadecimal characters).",
    );
  }
  const bytes = Uint8Array.from(
    hashHex.match(/.{2}/g) ?? [],
    (pair) => Number.parseInt(pair, 16),
  );
  return xdr.ScVal.scvBytes(bytes);
}

function normalizeEnum(value: unknown) {
  return Array.isArray(value) ? String(value[0]) : String(value);
}

function parseEvidence(value: unknown): EvidenceSubmission | null {
  if (!value) return null;
  const record = value as {
    evidence_hash: Uint8Array;
    version: number;
    submitted_at_ledger: number;
    submitted_at_timestamp: bigint;
  };
  return {
    hashHex: bytesToHex(record.evidence_hash),
    version: Number(record.version),
    submittedAtLedger: Number(record.submitted_at_ledger),
    submittedAtTimestamp: Number(record.submitted_at_timestamp),
  };
}

function parseApproval(value: unknown): MilestoneApproval | null {
  if (!value) return null;
  const record = value as {
    evidence_hash: Uint8Array;
    evidence_version: number;
    release_amount: bigint;
    approved_at_ledger: number;
    approved_at_timestamp: bigint;
  };
  return {
    hashHex: bytesToHex(record.evidence_hash),
    version: Number(record.evidence_version),
    releaseAmountBaseUnits: BigInt(record.release_amount),
    approvedAtLedger: Number(record.approved_at_ledger),
    approvedAtTimestamp: Number(record.approved_at_timestamp),
  };
}

export async function readDealSnapshot(
  deal: DemoDeal = KORI_DEMO_DEAL,
): Promise<DealSnapshot> {
  const server = createServer();
  const source = await server.getAccount(KORI_DEMO_READ_SOURCE);
  const contractBalanceArgs = [new Address(deal.contractId).toScVal()];

  const [
    stateValue,
    fundedValue,
    releasedValue,
    refundedValue,
    configValue,
    evidenceValue,
    approvalValue,
    refundReasonValue,
    escrowBalanceValue,
  ] = await Promise.all([
    simulateValue(server, source, deal.contractId, "state"),
    simulateValue(server, source, deal.contractId, "total_funded"),
    simulateValue(server, source, deal.contractId, "total_released"),
    simulateValue(server, source, deal.contractId, "total_refunded"),
    simulateValue(server, source, deal.contractId, "config"),
    simulateValue(server, source, deal.contractId, "evidence_submission"),
    simulateValue(server, source, deal.contractId, "milestone_approval"),
    simulateValue(server, source, deal.contractId, "refund_reason"),
    simulateValue(
      server,
      source,
      STELLAR_TESTNET_USDC.sacAddress,
      "balance",
      contractBalanceArgs,
    ),
  ]);

  const config = configValue as {
    asset: string;
    startup: string;
    fund_manager: string;
    release_authority: string;
    target_amount: bigint;
    funding_deadline: bigint;
    release_deadline: bigint;
  };

  return {
    contractId: deal.contractId,
    observedAtTimestamp: Math.floor(Date.now() / 1_000),
    state: normalizeEnum(stateValue) as DealState,
    asset: config.asset,
    startup: config.startup,
    fundManager: config.fund_manager,
    releaseAuthority: config.release_authority,
    totalFundedBaseUnits: BigInt(fundedValue as bigint),
    totalReleasedBaseUnits: BigInt(releasedValue as bigint),
    totalRefundedBaseUnits: BigInt(refundedValue as bigint),
    escrowBalanceBaseUnits: BigInt(escrowBalanceValue as bigint),
    targetBaseUnits: BigInt(config.target_amount),
    fundingDeadline: Number(config.funding_deadline),
    releaseDeadline: Number(config.release_deadline),
    evidence: parseEvidence(evidenceValue),
    approval: parseApproval(approvalValue),
    refundReason: refundReasonValue ? normalizeEnum(refundReasonValue) : null,
  };
}

export async function readInvestorPosition(
  deal: DemoDeal,
  investor: string,
): Promise<InvestorPosition> {
  const server = createServer();
  const source = await server.getAccount(KORI_DEMO_READ_SOURCE);
  const args = [new Address(investor).toScVal()];
  const [contribution, refunded, refundable] = await Promise.all([
    simulateValue(server, source, deal.contractId, "contribution", args),
    simulateValue(server, source, deal.contractId, "refunded_amount", args),
    simulateValue(server, source, deal.contractId, "refundable_amount", args),
  ]);
  return {
    contributionBaseUnits: BigInt(contribution as bigint),
    refundedBaseUnits: BigInt(refunded as bigint),
    refundableBaseUnits: BigInt(refundable as bigint),
  };
}

async function prepareContractXdr(
  deal: DemoDeal,
  sourceAddress: string,
  method: string,
  args: xdr.ScVal[] = [],
  timeoutSeconds = 300,
) {
  const server = createServer();
  const source = await server.getAccount(sourceAddress);
  const transaction = buildInvocation(
    source,
    deal.contractId,
    method,
    args,
    timeoutSeconds,
  );
  const prepared = await server.prepareTransaction(transaction);
  return prepared.toXDR();
}

export function prepareFundingXdr(
  investor: string,
  amountBaseUnits: bigint,
  deal: DemoDeal = KORI_DEMO_DEAL,
) {
  if (amountBaseUnits <= 0n) {
    throw new Error("The funding amount must be greater than zero.");
  }
  return prepareContractXdr(deal, investor, "fund", [
    new Address(investor).toScVal(),
    nativeToScVal(amountBaseUnits, { type: "i128" }),
  ]);
}

export function prepareEvidenceXdr(
  deal: DemoDeal,
  startup: string,
  evidenceHashHex: string,
) {
  return prepareContractXdr(deal, startup, "submit_evidence", [
    hashHexToScVal(evidenceHashHex),
  ]);
}

export function prepareApprovalXdr(
  deal: DemoDeal,
  fundManager: string,
  evidenceHashHex: string,
  evidenceVersion: number,
) {
  return prepareContractXdr(deal, fundManager, "approve_milestone", [
    hashHexToScVal(evidenceHashHex),
    nativeToScVal(evidenceVersion, { type: "u32" }),
  ]);
}

export function prepareReleaseXdr(deal: DemoDeal, snapshot: DealSnapshot) {
  if (!snapshot.approval) {
    throw new Error("The current evidence has not been approved.");
  }
  return prepareContractXdr(
    deal,
    snapshot.releaseAuthority,
    "release",
    [
      hashHexToScVal(snapshot.approval.hashHex),
      nativeToScVal(snapshot.approval.version, { type: "u32" }),
      nativeToScVal(snapshot.approval.releaseAmountBaseUnits, { type: "i128" }),
    ],
    15 * 60,
  );
}

export function prepareOpenRefundsXdr(deal: DemoDeal, caller: string) {
  return prepareContractXdr(deal, caller, "open_refunds");
}

export function prepareClaimRefundXdr(
  deal: DemoDeal,
  caller: string,
  investor: string,
) {
  return prepareContractXdr(deal, caller, "claim_refund", [
    new Address(investor).toScVal(),
  ]);
}

export function verifyReleaseSignatures(
  transactionXdr: string,
  signers: readonly VerifiedReleaseSigner[],
) {
  const transaction = TransactionBuilder.fromXDR(
    transactionXdr,
    STELLAR_TESTNET.networkPassphrase,
  );
  const hash = transaction.hash();

  return signers.filter((signer) => {
    const keypair = Keypair.fromPublicKey(signer.address);
    return transaction.signatures.some((signature) =>
      keypair.verify(hash, signature.signature),
    );
  });
}

function transactionBodyXdr(transactionXdr: string) {
  const transaction = TransactionBuilder.fromXDR(
    transactionXdr,
    STELLAR_TESTNET.networkPassphrase,
  );
  if ("innerTransaction" in transaction) {
    throw new Error("Fee-bump transactions are not accepted by this V1 flow.");
  }
  const envelope = transaction.toEnvelope();
  if (envelope.type !== "envelopeTypeTx") {
    throw new Error("Only standard Stellar transaction envelopes are accepted.");
  }
  return envelope.v1.tx.toXDR("base64");
}

export function validateSignedTransactionMatchesPreparation(
  preparedTransactionXdr: string,
  signedTransactionXdr: string,
) {
  if (
    transactionBodyXdr(preparedTransactionXdr) !==
    transactionBodyXdr(signedTransactionXdr)
  ) {
    throw new Error("Freighter returned a transaction that differs from the prepared action.");
  }
}

export function validateReleaseTransactionXdr(
  transactionXdr: string,
  deal: DemoDeal,
  snapshot: DealSnapshot,
) {
  if (!snapshot.approval) {
    throw new Error("The current deal has no approved evidence to release.");
  }

  const transaction = TransactionBuilder.fromXDR(
    transactionXdr,
    STELLAR_TESTNET.networkPassphrase,
  );
  if ("innerTransaction" in transaction) {
    throw new Error("Fee-bump release packages are not accepted by this V1 flow.");
  }
  if (transaction.source !== snapshot.releaseAuthority) {
    throw new Error("The release transaction has an unexpected source account.");
  }
  if (transaction.memo.type !== "none") {
    throw new Error("Release packages cannot contain a memo.");
  }
  if (BigInt(transaction.fee) > RELEASE_PACKAGE_MAX_FEE_STROOPS) {
    throw new Error("The release package fee exceeds the V1 safety limit.");
  }
  const maxTime = Number(transaction.timeBounds?.maxTime ?? 0);
  const now = Math.floor(Date.now() / 1_000);
  if (!Number.isSafeInteger(maxTime) || maxTime <= now) {
    throw new Error("The release package has expired or has no finite expiry.");
  }
  if (maxTime - now > RELEASE_PACKAGE_MAX_REMAINING_SECONDS) {
    throw new Error("The release package expiry exceeds the V1 safety window.");
  }
  if (transaction.operations.length !== 1) {
    throw new Error("A release package must contain exactly one operation.");
  }

  const operation = transaction.operations[0];
  if (operation.type !== "invokeHostFunction") {
    throw new Error("The release package does not contain a Soroban invocation.");
  }
  if (operation.source) {
    throw new Error("A release package cannot override the operation source.");
  }
  if (operation.func.type !== "hostFunctionTypeInvokeContract") {
    throw new Error("The release package does not invoke a contract function.");
  }

  const invocation = operation.func.invokeContract;
  if (
    Address.fromScAddress(invocation.contractAddress).toString() !==
    deal.contractId
  ) {
    throw new Error("The release package targets another contract.");
  }
  if (invocation.functionName.toStringStrict() !== "release") {
    throw new Error("The release package calls another contract method.");
  }
  if (invocation.args.length !== 3) {
    throw new Error("The release package contains unexpected arguments.");
  }

  const hashHex = bytesToHex(scValToNative(invocation.args[0]));
  const version = Number(scValToNative(invocation.args[1]));
  const amount = BigInt(scValToNative(invocation.args[2]) as bigint);
  if (
    hashHex !== snapshot.approval.hashHex ||
    version !== snapshot.approval.version ||
    amount !== snapshot.approval.releaseAmountBaseUnits ||
    amount !== snapshot.targetBaseUnits
  ) {
    throw new Error(
      "The release package does not match the approved evidence and amount.",
    );
  }

  return transaction;
}

export async function submitTransactionXdr(
  signedTransactionXdr: string,
  onSubmitted?: (hash: string) => void,
): Promise<TransactionReceipt> {
  const server = createServer();
  const transaction = TransactionBuilder.fromXDR(
    signedTransactionXdr,
    STELLAR_TESTNET.networkPassphrase,
  );
  const submission = await server.sendTransaction(transaction);

  if (submission.status !== "PENDING" && submission.status !== "DUPLICATE") {
    throw new Error(`Stellar RPC rejected the transaction: ${submission.status}.`);
  }

  onSubmitted?.(submission.hash);
  const result = await server.pollTransaction(submission.hash, {
    attempts: 30,
    sleepStrategy: () => 1_000,
  });

  if (result.status === Api.GetTransactionStatus.FAILED) {
    throw new Error("The transaction was included but failed on Stellar Testnet.");
  }
  if (result.status === Api.GetTransactionStatus.NOT_FOUND) {
    throw new Error(
      "The transaction was submitted but was not confirmed before the timeout.",
    );
  }

  return {
    hash: result.txHash,
    ledger: result.ledger,
    createdAt: result.createdAt,
  };
}

export const submitFundingXdr = submitTransactionXdr;
