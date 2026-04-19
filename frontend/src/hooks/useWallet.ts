"use client";

import { useState, useCallback, useEffect } from "react";
import { WalletState } from "@/types";

// We use dynamic import to avoid SSR issues with wallet kit
let walletKit: any = null;

async function getWalletKit() {
  if (walletKit) return walletKit;
  if (typeof window === "undefined") return null;

  try {
    const { StellarWalletsKit, WalletNetwork, ALBEDO_ID, FREIGHTER_ID, XBULL_ID } =
      await import("@creit.tech/stellar-wallets-kit");

    walletKit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: [],
    });

    return walletKit;
  } catch {
    return null;
  }
}

const WALLET_KEY = "stellarpay_wallet_address";

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    network: "testnet",
  });

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(WALLET_KEY);
    if (saved) {
      setState((s) => ({ ...s, address: saved, isConnected: true }));
    }
  }, []);

  const connect = useCallback(async (walletId = "freighter") => {
    setState((s) => ({ ...s, isConnecting: true }));
    try {
      const kit = await getWalletKit();
      if (!kit) throw new Error("Wallet kit not available");

      await kit.setWallet(walletId);
      const { address } = await kit.getAddress();

      localStorage.setItem(WALLET_KEY, address);
      setState({
        address,
        isConnected: true,
        isConnecting: false,
        network: "testnet",
      });

      return address;
    } catch (err) {
      console.error("Wallet connect error:", err);
      setState((s) => ({ ...s, isConnecting: false }));
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(WALLET_KEY);
    walletKit = null;
    setState({
      address: null,
      isConnected: false,
      isConnecting: false,
      network: "testnet",
    });
  }, []);

  const signTransaction = useCallback(async (xdr: string): Promise<string> => {
    const kit = await getWalletKit();
    if (!kit) throw new Error("Wallet not connected");

    const { signedTxXdr } = await kit.signTransaction(xdr, {
      networkPassphrase: "Test SDF Network ; September 2015",
    });

    return signedTxXdr;
  }, []);

  return { ...state, connect, disconnect, signTransaction };
}
