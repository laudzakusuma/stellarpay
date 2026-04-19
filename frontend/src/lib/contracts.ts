import * as StellarSdk from '@stellar/stellar-sdk';

const SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';

const SPLIT_BILL_CONTRACT_ID = process.env.NEXT_PUBLIC_SPLIT_BILL_CONTRACT_ID || '';
const ESCROW_CONTRACT_ID = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID || '';

export const rpc = new StellarSdk.rpc.Server(SOROBAN_RPC_URL);

// ── Helper: build & simulate a Soroban tx ────────────────────────────────────

async function buildContractTx(params: {
  publicKey: string;
  contractId: string;
  method: string;
  args: StellarSdk.xdr.ScVal[];
}): Promise<StellarSdk.Transaction> {
  const { publicKey, contractId, method, args } = params;

  const account = await rpc.getAccount(publicKey);
  const contract = new StellarSdk.Contract(contractId);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simulated = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }

  return StellarSdk.rpc.assembleTransaction(tx, simulated).build();
}

// ── SplitBill contract calls ──────────────────────────────────────────────────

export async function createBill(params: {
  publicKey: string;
  title: string;
  tokenAddress: string;
  members: string[];
  amounts: bigint[];
}): Promise<StellarSdk.Transaction> {
  const { publicKey, title, tokenAddress, members, amounts } = params;

  const args: StellarSdk.xdr.ScVal[] = [
    StellarSdk.Address.fromString(publicKey).toScVal(),
    StellarSdk.xdr.ScVal.scvString(title),
    StellarSdk.Address.fromString(tokenAddress).toScVal(),
    StellarSdk.xdr.ScVal.scvVec(
      members.map((m) => StellarSdk.Address.fromString(m).toScVal()),
    ),
    StellarSdk.xdr.ScVal.scvVec(
      amounts.map((a) => StellarSdk.nativeToScVal(a, { type: 'i128' })),
    ),
  ];

  return buildContractTx({
    publicKey,
    contractId: SPLIT_BILL_CONTRACT_ID,
    method: 'create_bill',
    args,
  });
}

export async function payShare(params: {
  publicKey: string;
  billId: bigint;
}): Promise<StellarSdk.Transaction> {
  const { publicKey, billId } = params;

  const args: StellarSdk.xdr.ScVal[] = [
    StellarSdk.Address.fromString(publicKey).toScVal(),
    StellarSdk.nativeToScVal(billId, { type: 'u64' }),
  ];

  return buildContractTx({
    publicKey,
    contractId: SPLIT_BILL_CONTRACT_ID,
    method: 'pay_share',
    args,
  });
}

export async function getBill(billId: bigint) {
  const contract = new StellarSdk.Contract(SPLIT_BILL_CONTRACT_ID);
  const account = await rpc.getAccount(
    'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
  );
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      contract.call('get_bill', StellarSdk.nativeToScVal(billId, { type: 'u64' })),
    )
    .setTimeout(30)
    .build();

  const sim = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationSuccess(sim) && sim.result) {
    return StellarSdk.scValToNative(sim.result.retval);
  }
  throw new Error('Failed to get bill');
}

export async function getBillCount(): Promise<bigint> {
  const contract = new StellarSdk.Contract(SPLIT_BILL_CONTRACT_ID);
  const account = await rpc.getAccount(
    'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
  );
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(contract.call('get_bill_count'))
    .setTimeout(30)
    .build();

  const sim = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationSuccess(sim) && sim.result) {
    return StellarSdk.scValToNative(sim.result.retval) as bigint;
  }
  return 0n;
}

// ── Submit signed XDR ─────────────────────────────────────────────────────────

export async function submitSorobanTx(signedXdr: string) {
  const tx = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    StellarSdk.Networks.TESTNET,
  ) as StellarSdk.Transaction;
  const result = await rpc.sendTransaction(tx);
  if (result.status === 'ERROR') {
    throw new Error(`Transaction error: ${result.errorResult}`);
  }
  return result;
}
