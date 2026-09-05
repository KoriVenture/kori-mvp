import {
  Address,
  BASE_FEE,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";
import { Api, Server } from "@stellar/stellar-sdk/rpc";

import { KORI_DEMO_DEAL, STELLAR_TESTNET } from "./demo-config";

export type DealSnapshot = {
  state: string;
  totalFundedBaseUnits: bigint;
  targetBaseUnits: bigint;
  fundingDeadline: number;
  releaseDeadline: number;
};

export type FundingReceipt = {
  hash: string;
  ledger: number;
  createdAt: number;
};

function createServer() {
  return new Server(STELLAR_TESTNET.rpcUrl, { allowHttp: false });
}

function buildInvocation(
  source: Awaited<ReturnType<Server["getAccount"]>>,
  method: string,
  ...args: ReturnType<Address["toScVal"]>[]
) {
  return new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_TESTNET.networkPassphrase,
  })
    .addOperation(new Contract(KORI_DEMO_DEAL.contractId).call(method, ...args))
    .setTimeout(300)
    .build();
}

async function simulateValue(
  server: Server,
  source: Awaited<ReturnType<Server["getAccount"]>>,
  method: string,
) {
  const response = await server.simulateTransaction(
    buildInvocation(source, method),
  );

  if (!Api.isSimulationSuccess(response) || !response.result) {
    const detail = Api.isSimulationError(response)
      ? response.error
      : `No result returned for ${method}.`;
    throw new Error(detail);
  }

  return scValToNative(response.result.retval) as unknown;
}

export async function readDealSnapshot(): Promise<DealSnapshot> {
  const server = createServer();
  const source = await server.getAccount(KORI_DEMO_DEAL.readSource);
  const [stateValue, fundedValue, configValue] = await Promise.all([
    simulateValue(server, source, "state"),
    simulateValue(server, source, "total_funded"),
    simulateValue(server, source, "config"),
  ]);

  const config = configValue as {
    target_amount: bigint;
    funding_deadline: bigint;
    release_deadline: bigint;
  };
  const state = Array.isArray(stateValue)
    ? String(stateValue[0])
    : String(stateValue);

  return {
    state,
    totalFundedBaseUnits: BigInt(fundedValue as bigint),
    targetBaseUnits: BigInt(config.target_amount),
    fundingDeadline: Number(config.funding_deadline),
    releaseDeadline: Number(config.release_deadline),
  };
}

export async function prepareFundingXdr(
  investor: string,
  amountBaseUnits: bigint,
) {
  if (amountBaseUnits <= 0n) {
    throw new Error("The funding amount must be greater than zero.");
  }

  const server = createServer();
  const source = await server.getAccount(investor);
  const transaction = buildInvocation(
    source,
    "fund",
    new Address(investor).toScVal(),
    nativeToScVal(amountBaseUnits, { type: "i128" }),
  );
  const prepared = await server.prepareTransaction(transaction);

  return prepared.toXDR();
}

export async function submitFundingXdr(
  signedTransactionXdr: string,
  onSubmitted?: (hash: string) => void,
): Promise<FundingReceipt> {
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
