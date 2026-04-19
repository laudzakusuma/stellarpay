  'use client';

import { useState, useCallback } from 'react';
import { Wallet, ChevronDown, Copy, LogOut, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { truncateAddress } from '@/lib/stellar';
import { useWalletStore } from '@/lib/walletStore';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

const WALLETS = [
  {
    id: 'freighter' as const,
    name: 'Freighter',
    description: 'Browser extension by Stellar',
    bgColor: '#6366F1',
    installUrl: 'https://www.freighter.app/',
    isWebBased: false,
  },
  {
    id: 'albedo' as const,
    name: 'Albedo',
    description: 'Web-based, no install needed',
    bgColor: '#0EA5E9',
    installUrl: 'https://albedo.link/',
    isWebBased: true,
  },
  {
    id: 'xbull' as const,
    name: 'xBull',
    description: 'Mobile-friendly wallet',
    bgColor: '#F59E0B',
    installUrl: 'https://xbull.app/',
    isWebBased: false,
  },
];

type WalletId = 'freighter' | 'albedo' | 'xbull';

async function connectFreighter(): Promise<string> {
  const f = (window as any).freighter;
  if (!f) throw new Error('INSTALL');
  const isAllowed = await f.isAllowed();
  if (!isAllowed) await f.setAllowed();
  return await f.getPublicKey();
}

async function connectAlbedo(): Promise<string> {
  const albedo = (await import('@albedo-link/intent')).default;
  const res = await albedo.publicKey({ token: 'stellarpay' });
  return res.pubkey;
}

async function connectXBull(): Promise<string> {
  const xbull = (window as any).xBullSDK;
  if (!xbull) throw new Error('INSTALL');
  await xbull.connect({ canRequestPublicKey: true, canRequestSign: true });
  return await xbull.getPublicKey();
}

function WalletIcon({ color, letter }: { color: string; letter: string }) {
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-display font-bold text-sm"
      style={{ background: color }}
    >
      {letter}
    </div>
  );
}

export function WalletButton() {
  const { publicKey, isConnected, isConnecting, walletName, connect, disconnect, setConnecting } =
    useWalletStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connectingId, setConnectingId] = useState<WalletId | null>(null);

  const isInstalled = (walletId: WalletId) => {
    if (walletId === 'albedo') return true;
    if (walletId === 'freighter') return typeof window !== 'undefined' && !!(window as any).freighter;
    if (walletId === 'xbull') return typeof window !== 'undefined' && !!(window as any).xBullSDK;
    return false;
  };

  const handleSelectWallet = useCallback(
    async (walletId: WalletId) => {
      const wallet = WALLETS.find((w) => w.id === walletId)!;
      setConnectingId(walletId);
      setConnecting(true);
      try {
        let key = '';
        if (walletId === 'freighter') {
          try { key = await connectFreighter(); }
          catch (e: any) {
            if (e.message === 'INSTALL') {
              toast.error('Freighter not installed — opening download page');
              window.open(wallet.installUrl, '_blank');
              return;
            }
            throw e;
          }
        } else if (walletId === 'albedo') {
          key = await connectAlbedo();
        } else if (walletId === 'xbull') {
          try { key = await connectXBull(); }
          catch (e: any) {
            if (e.message === 'INSTALL') {
              toast.error('xBull not installed — opening download page');
              window.open(wallet.installUrl, '_blank');
              return;
            }
            throw e;
          }
        }
        connect(key, wallet.name);
        setShowSelector(false);
        toast.success(`${wallet.name} connected`);
      } catch (err: any) {
        toast.error(err?.message || 'Connection failed');
      } finally {
        setConnecting(false);
        setConnectingId(null);
      }
    },
    [connect, setConnecting],
  );

  const handleCopy = useCallback(async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Address copied');
  }, [publicKey]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setShowMenu(false);
    toast.success('Wallet disconnected');
  }, [disconnect]);

  if (!isConnected) {
    return (
      <>
        <Button
          variant="secondary"
          size="sm"
          loading={isConnecting}
          leftIcon={<Wallet className="w-3.5 h-3.5" />}
          onClick={() => setShowSelector(true)}
          className="border-accent-gold/20 hover:border-accent-gold/40"
        >
          Connect Wallet
        </Button>

        {showSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSelector(false)} />
            <div className="relative w-full max-w-sm glass-card rounded-2xl shadow-card-hover animate-fade-up border border-white/[0.08]">
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                <div>
                  <h2 className="font-display font-semibold text-text-primary">Connect Wallet</h2>
                  <p className="text-xs text-text-muted mt-0.5">Choose your Stellar wallet</p>
                </div>
                <button
                  onClick={() => setShowSelector(false)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 space-y-2">
                {WALLETS.map((wallet) => {
                  const available = isInstalled(wallet.id);
                  const loading = connectingId === wallet.id;
                  return (
                    <button
                      key={wallet.id}
                      onClick={() => handleSelectWallet(wallet.id)}
                      disabled={!!connectingId}
                      className={cn(
                        'w-full flex items-center gap-3.5 p-3.5 rounded-xl text-left transition-all duration-200',
                        'border border-white/[0.06] hover:border-accent-gold/30 hover:bg-accent-gold/5',
                        'disabled:opacity-60 disabled:cursor-not-allowed',
                        loading && 'border-accent-gold/40 bg-accent-gold/5',
                      )}
                    >
                      <WalletIcon color={wallet.bgColor} letter={wallet.name[0]} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display font-semibold text-sm text-text-primary">
                            {wallet.name}
                          </p>
                          {wallet.isWebBased && (
                            <span className="text-[10px] text-status-success px-1.5 py-0.5 rounded-full bg-status-success/10 font-medium">
                              No install
                            </span>
                          )}
                          {!available && !wallet.isWebBased && (
                            <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded-full border border-white/[0.08]">
                              Not installed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">{wallet.description}</p>
                      </div>
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-accent-gold/30 border-t-accent-gold rounded-full animate-spin shrink-0" />
                      ) : !available && !wallet.isWebBased ? (
                        <ExternalLink className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-text-muted -rotate-90 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="px-5 pb-4 text-xs text-text-muted text-center border-t border-white/[0.06] pt-3">
                Stellar Testnet — No real funds involved
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu((v) => !v)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-xl',
          'bg-surface-2 border border-white/[0.08]',
          'hover:border-white/[0.14] transition-all duration-200',
        )}
      >
        <span className="w-2 h-2 rounded-full bg-status-success animate-pulse-slow" />
        <span className="font-mono text-xs text-text-secondary">{truncateAddress(publicKey!, 4)}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 text-text-muted transition-transform duration-200', showMenu && 'rotate-180')} />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 w-64 glass-card rounded-xl shadow-card-hover p-1 border border-white/[0.06]">
            <div className="px-3 py-2.5 border-b border-white/[0.06] mb-1">
              <p className="text-xs text-text-muted">{walletName}</p>
              <p className="text-xs font-mono text-text-secondary mt-0.5 break-all leading-relaxed">{publicKey}</p>
            </div>
            <button onClick={handleCopy} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-all">
              {copied ? <CheckCircle2 className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Address'}
            </button>
            <button onClick={handleDisconnect} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-status-error hover:bg-status-error/10 transition-all">
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
}
