import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatUsdc(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  }).format(num);
}

export function stroopsToXlm(stroops: string | number): string {
  const n = typeof stroops === "string" ? parseInt(stroops, 10) : stroops;
  return (n / 10_000_000).toFixed(7);
}

export function xlmToStroops(xlm: string | number): number {
  const n = typeof xlm === "string" ? parseFloat(xlm) : xlm;
  return Math.round(n * 10_000_000);
}

export function usdcToContractAmount(usdc: string | number): bigint {
  // USDC has 7 decimal places on Stellar
  const n = typeof usdc === "string" ? parseFloat(usdc) : usdc;
  return BigInt(Math.round(n * 10_000_000));
}

export function contractAmountToUsdc(amount: bigint | number): string {
  const n = typeof amount === "bigint" ? Number(amount) : amount;
  return (n / 10_000_000).toFixed(2);
}

export function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address);
}

export function generatePaymentLinkId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 12 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
