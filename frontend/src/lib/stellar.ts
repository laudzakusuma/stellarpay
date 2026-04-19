'use client';

// Browser-safe Stellar helpers — no Node.js native modules
// Heavy SDK operations (tx building, signing) are handled server-side or via wallet

const HORIZON_URL =
  process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';

export const USDC_ISSUER =
  process.env.NEXT_PUBLIC_USDC_ISSUER ||
  'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

export const USDC_CODE = 'USDC';
export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

// ── Address utilities ─────────────────────────────────────────────────────────

export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  // Stellar G-addresses: starts with G, 56 chars, base32 charset
  return /^G[A-Z2-7]{55}$/.test(address.trim());
}

export function isValidContractAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  return /^C[A-Z2-7]{55}$/.test(address.trim());
}

export function truncateAddress(address: string, chars = 6): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// ── Amount formatting ─────────────────────────────────────────────────────────

export function formatAmount(amount: string | number, decimals = 2): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function parseUSDCAmount(amount: string): bigint {
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) return 0n;
  return BigInt(Math.round(parsed * 10_000_000));
}

export function formatUSDCAmount(raw: bigint): string {
  return (Number(raw) / 10_000_000).toFixed(2);
}

// ── Horizon REST API (no native deps) ────────────────────────────────────────

export interface AccountBalance {
  asset: string;
  balance: string;
  issuer?: string;
}

export async function getAccountBalances(publicKey: string): Promise<AccountBalance[]> {
  const res = await fetch(`${HORIZON_URL}/accounts/${publicKey}`);
  if (!res.ok) throw new Error('Account not found');
  const data = await res.json();
  return data.balances.map((b: any) => {
    if (b.asset_type === 'native') return { asset: 'XLM', balance: b.balance };
    return { asset: b.asset_code, balance: b.balance, issuer: b.asset_issuer };
  });
}

export async function getTransactionHistory(publicKey: string, limit = 20) {
  const res = await fetch(
    `${HORIZON_URL}/accounts/${publicKey}/payments?limit=${limit}&order=desc`,
  );
  if (!res.ok) throw new Error('Failed to fetch payments');
  const data = await res.json();
  return data._embedded?.records || [];
}

export async function submitTransactionXDR(signedXDR: string) {
  const res = await fetch(`${HORIZON_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `tx=${encodeURIComponent(signedXDR)}`,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.extras?.result_codes?.transaction || 'Submission failed');
  return data;
}

export async function fundTestnetAccount(publicKey: string) {
  const res = await fetch(`https://friendbot.stellar.org/?addr=${publicKey}`);
  return res.ok;
}
