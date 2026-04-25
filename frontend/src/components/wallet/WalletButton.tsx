'use client';

import { useState, useCallback, useEffect } from 'react';
import { Wallet, ChevronDown, Copy, LogOut, CheckCircle2, X, ExternalLink, Shield } from 'lucide-react';
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
    letter: 'F',
    installUrl: 'https://www.freighter.app/',
    isWebBased: false,
  },
  {
    id: 'albedo' as const,
    name: 'Albedo',
    description: 'Web-based, no install needed',
    bgColor: '#0EA5E9',
    letter: 'A',
    installUrl: 'https://albedo.link/',
    isWebBased: true,
  },
  {
    id: 'xbull' as const,
    name: 'xBull',
    description: 'Mobile-friendly wallet',
    bgColor: '#F59E0B',
    letter: 'X',
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

export function WalletButton() {
  const { publicKey, isConnected, isConnecting, walletName, connect, disconnect, setConnecting } =
    useWalletStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connectingId, setConnectingId] = useState<WalletId | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isInstalled = (walletId: WalletId) => {
    if (!mounted) return false;
    if (walletId === 'albedo') return true;
    if (walletId === 'freighter') return !!(window as any).freighter;
    if (walletId === 'xbull') return !!(window as any).xBullSDK;
    return false;
  };

  const handleSelectWallet = useCallback(async (walletId: WalletId) => {
    const wallet = WALLETS.find((w) => w.id === walletId)!;
    setConnectingId(walletId);
    setConnecting(true);
    try {
      let key = '';
      if (walletId === 'freighter') {
        try { key = await connectFreighter(); }
        catch (e: any) {
          if (e.message === 'INSTALL') {
            toast.error('Freighter not installed');
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
            toast.error('xBull not installed');
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
  }, [connect, setConnecting]);

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
            {/* Blur backdrop */}
            <div
              className="absolute inset-0"
              style={{
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                backgroundColor: 'rgba(8, 12, 20, 0.8)',
              }}
              onClick={() => setShowSelector(false)}
            />

            {/* Modal */}
            <div
              className="relative w-full max-w-sm rounded-2xl border border-white/[0.08] overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(17,24,39,0.99) 0%, rgba(13,19,33,1) 100%)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
                animation: 'walletSlideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* Gold line top */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(232,184,109,0.5), transparent)' }}
              />

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-5">
                <div>
                  <h2 className="font-display font-bold text-base text-text-primary">
                    Connect a Wallet
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Choose your Stellar wallet to continue
                  </p>
                </div>
                <button
                  onClick={() => setShowSelector(false)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mx-6 h-px bg-white/[0.05]" />

              {/* Wallet options */}
              <div className="p-3 space-y-1.5">
                {WALLETS.map((wallet) => {
                  const available = isInstalled(wallet.id);
                  const loading = connectingId === wallet.id;
                  return (
                    <button
                      key={wallet.id}
                      onClick={() => handleSelectWallet(wallet.id)}
                      disabled={!!connectingId}
                      className={cn(
                        'w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left',
                        'border transition-all duration-150 group',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        loading
                          ? 'border-accent-gold/30 bg-accent-gold/5'
                          : 'border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]',
                      )}
                    >
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-display font-bold text-sm text-white"
                        style={{
                          background: wallet.bgColor,
                          boxShadow: `0 4px 12px ${wallet.bgColor}40`,
                        }}
                      >
                        {wallet.letter}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-semibold text-sm text-text-primary group-hover:text-white transition-colors">
                            {wallet.name}
                          </span>
                          {wallet.isWebBased && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              No install
                            </span>
                          )}
                          {!available && !wallet.isWebBased && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.04] text-text-muted border border-white/[0.06]">
                              Not installed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">{wallet.description}</p>
                      </div>

                      {/* Arrow / spinner */}
                      <div className="shrink-0 text-text-muted">
                        {loading ? (
                          <div
                            className="w-4 h-4 rounded-full border-2 animate-spin"
                            style={{
                              borderColor: 'rgba(232,184,109,0.2)',
                              borderTopColor: '#E8B86D',
                            }}
                          />
                        ) : !available && !wallet.isWebBased ? (
                          <ExternalLink className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 -rotate-90 group-hover:text-text-secondary transition-colors" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer note */}
              <div className="mx-3 mb-3 px-4 py-2.5 rounded-xl flex items-center gap-2.5 bg-white/[0.02] border border-white/[0.04]">
                <Shield className="w-3.5 h-3.5 text-text-muted shrink-0" />
                <p className="text-xs text-text-muted">
                  Stellar Testnet only — no real funds involved
                </p>
              </div>
            </div>

            <style>{`
              @keyframes walletSlideUp {
                from { opacity: 0; transform: translateY(20px) scale(0.96); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>
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
        <span
          className="w-2 h-2 rounded-full bg-emerald-400"
          style={{ boxShadow: '0 0 6px rgba(52,211,153,0.6)' }}
        />
        <span className="font-mono text-xs text-text-secondary">{truncateAddress(publicKey!, 4)}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 text-text-muted transition-transform duration-200', showMenu && 'rotate-180')} />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div
            className="absolute right-0 top-full mt-2 z-20 w-64 rounded-xl p-1 border border-white/[0.06]"
            style={{
              background: 'rgba(13,19,33,0.97)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
          >
            <div className="px-3 py-2.5 border-b border-white/[0.06] mb-1">
              <p className="text-xs text-text-muted">{walletName}</p>
              <p className="text-xs font-mono text-text-secondary mt-0.5 break-all leading-relaxed">{publicKey}</p>
            </div>
            <button onClick={handleCopy} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-all">
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Address'}
            </button>
            <button onClick={handleDisconnect} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
}
