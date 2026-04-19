export type Network = "testnet" | "mainnet";

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  network: Network;
}

export interface Bill {
  id: number;
  title: string;
  owner: string;
  totalAmount: string;
  token: string;
  members: BillMember[];
  collected: string;
  status: "Active" | "Completed" | "Cancelled";
  createdAt: number;
}

export interface BillMember {
  address: string;
  amount: string;
  paid: boolean;
  label?: string;
}

export interface RemittanceForm {
  recipient: string;
  amount: string;
  memo: string;
  asset: "USDC" | "XLM";
}

export interface SplitBillForm {
  title: string;
  totalAmount: string;
  members: { address: string; label: string; amount: string }[];
}

export interface PaymentLink {
  id: string;
  recipient: string;
  amount: string;
  asset: string;
  memo: string;
  expiresAt: number;
  createdAt: number;
}

export interface Transaction {
  id: string;
  type: "send" | "receive" | "split";
  amount: string;
  asset: string;
  counterparty: string;
  memo?: string;
  status: "pending" | "success" | "failed";
  timestamp: number;
  hash: string;
}
