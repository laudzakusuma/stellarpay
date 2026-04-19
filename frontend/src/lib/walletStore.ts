import { create } from 'zustand';

interface WalletState {
  publicKey: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  walletName: string | null;
  connect: (publicKey: string, walletName: string) => void;
  disconnect: () => void;
  setConnecting: (v: boolean) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  publicKey: null,
  isConnected: false,
  isConnecting: false,
  walletName: null,
  connect: (publicKey, walletName) =>
    set({ publicKey, walletName, isConnected: true, isConnecting: false }),
  disconnect: () =>
    set({ publicKey: null, walletName: null, isConnected: false, isConnecting: false }),
  setConnecting: (v) => set({ isConnecting: v }),
}));
