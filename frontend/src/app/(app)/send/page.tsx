'use client';

import { useState, useCallback } from 'react';
import { Send, AlertCircle, CheckCircle2, Info, ExternalLink, Copy } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useWalletStore } from '@/lib/walletStore';
import { isValidStellarAddress, truncateAddress, formatAmount } from '@/lib/stellar';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type Step = 'form' | 'review' | 'success';

interface TxResult {
  hash: string;
  amount: string;
  destination: string;
}

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
const FEE_ESTIMATE = '0.00001';

// IDR rate (approximate testnet demo only)
const XLM_TO_IDR = 3200;

async function sendPayment(params: {
  fromPublicKey: string;
  walletName: string;
  destination: string;
  amount: string;
  memo?: string;
}): Promise<string> {
  const { fromPublicKey, walletName, destination, amount, memo } = params;

  const StellarSdk = await import('@stellar/stellar-sdk');
  const server = new StellarSdk.Horizon.Server(HORIZON_URL);
  const account = await server.loadAccount(fromPublicKey);

  const txBuilder = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  txBuilder.addOperation(
    StellarSdk.Operation.payment({
      destination,
      asset: StellarSdk.Asset.native(),
      amount,
    }),
  );

  if (memo?.trim()) {
    txBuilder.addMemo(StellarSdk.Memo.text(memo.trim().slice(0, 28)));
  }

  txBuilder.setTimeout(30);
  const tx = txBuilder.build();
  const txXDR = tx.toXDR();

  let signedXDR = '';

  if (walletName === 'Freighter') {
    const freighter = (window as any).freighter;
    if (!freighter) throw new Error('Freighter not found');
    signedXDR = await freighter.signTransaction(txXDR, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });
  } else if (walletName === 'Albedo') {
    const albedo = (await import('@albedo-link/intent')).default;
    const res = await albedo.tx({
      xdr: txXDR,
      network: 'testnet',
      submit: false,
    });
    signedXDR = res.signed_envelope_xdr;
  } else if (walletName === 'xBull') {
    const xbull = (window as any).xBullSDK;
    if (!xbull) throw new Error('xBull not found');
    signedXDR = await xbull.signXDR(txXDR, { networkPassphrase: NETWORK_PASSPHRASE });
  } else {
    throw new Error('Unknown wallet — cannot sign');
  }

  const submitRes = await fetch(`${HORIZON_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `tx=${encodeURIComponent(signedXDR)}`,
  });

  const data = await submitRes.json();
  if (!submitRes.ok) {
    const code = data?.extras?.result_codes?.transaction || 'tx_failed';
    throw new Error(`Transaction failed: ${code}`);
  }

  return data.hash;
}

export default function SendPage() {
  const { publicKey, isConnected, walletName } = useWalletStore();

  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [copied, setCopied] = useState(false);

  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [destError, setDestError] = useState('');

  // IDR estimate — based on user feedback (Budi Santoso)
  const idrEstimate = amount && parseFloat(amount) > 0
    ? `≈ Rp ${(parseFloat(amount) * XLM_TO_IDR).toLocaleString('id-ID')}`
    : null;

  const validateDest = useCallback((val: string) => {
    if (!val) { setDestError('Destination is required'); return false; }
    if (!isValidStellarAddress(val)) { setDestError('Invalid Stellar address'); return false; }
    setDestError('');
    return true;
  }, []);

  const handleReview = () => {
    if (!validateDest(destination)) return;
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return; }
    setStep('review');
  };

  const handleSend = async () => {
    if (!isConnected || !publicKey) { toast.error('Connect your wallet first'); return; }

    setLoading(true);
    try {
      const hash = await sendPayment({
        fromPublicKey: publicKey,
        walletName: walletName || '',
        destination,
        amount,
        memo,
      });

      setTxResult({ hash, amount, destination });
      setStep('success');
      toast.success('Transaction confirmed on Stellar!');
    } catch (err: any) {
      const msg = err?.message || 'Transaction failed';
      if (msg.includes('User') || msg.includes('cancel') || msg.includes('reject')) {
        toast.error('Transaction cancelled by user');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Copy payment link — based on user feedback (Dedi Kurniawan)
  const handleCopyPaymentLink = useCallback(async () => {
    if (!txResult) return;
    const link = `${window.location.origin}/pay/${txResult.hash.slice(0, 12)}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Payment link copied!');
  }, [txResult]);

  const reset = () => {
    setStep('form');
    setDestination('');
    setAmount('');
    setMemo('');
    setTxResult(null);
    setCopied(false);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8 animate-fade-up">
        <h1 className="font-display font-bold text-3xl text-text-primary">Send USDC</h1>
        <p className="text-text-secondary font-body text-sm mt-1.5">
          Instant borderless transfers on Stellar Testnet
        </p>
      </div>

      {/* ── FORM ── */}
      {step === 'form' && (
        <div className="space-y-4 animate-fade-up stagger-1">
          {!isConnected && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-status-warning/10 border border-status-warning/20">
              <AlertCircle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
              <p className="text-sm text-status-warning">Connect your wallet to send transactions.</p>
            </div>
          )}

          <Card>
            <CardHeader title="Transfer Details" />
            <div className="space-y-5">
              <Input
                label="Recipient Address"
                placeholder="G... (Stellar public key)"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  if (destError) validateDest(e.target.value);
                }}
                onBlur={() => validateDest(destination)}
                error={destError}
                hint="Enter a valid Stellar public key (starts with G)"
                rightAddon={
                  destination && isValidStellarAddress(destination) ? (
                    <CheckCircle2 className="w-4 h-4 text-status-success" />
                  ) : undefined
                }
              />

              {/* Amount with IDR estimate — feedback from Budi Santoso */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Amount (XLM)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 pr-20 rounded-xl bg-surface-2 border border-white/[0.06] text-text-primary placeholder:text-text-muted font-mono text-lg focus:outline-none focus:border-accent-gold/40 focus:ring-1 focus:ring-accent-gold/20 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-secondary">
                    XLM
                  </span>
                </div>

                {/* IDR estimate — implemented based on Budi Santoso feedback */}
                {idrEstimate ? (
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs text-accent-gold font-medium">{idrEstimate}</span>
                    <span className="text-xs text-text-muted">(testnet estimate only)</span>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted px-1">Testnet XLM — no real value</p>
                )}
              </div>

              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-accent-cyan/5 border border-accent-cyan/15">
                <Info className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-accent-cyan">Real On-chain Transaction</p>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                    Your wallet will prompt you to sign. Transaction settles in under 5 seconds.
                  </p>
                </div>
              </div>

              <Input
                label="Memo (optional)"
                placeholder="Payment reference..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                hint="Max 28 characters — visible on-chain"
              />

              <div className="flex items-center justify-between py-3 border-t border-white/[0.06] text-sm">
                <span className="text-text-muted">Estimated Fee</span>
                <span className="font-mono text-text-secondary">{FEE_ESTIMATE} XLM</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleReview}
                disabled={!destination || !amount}
                rightIcon={<Send className="w-4 h-4" />}
              >
                Review Transfer
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── REVIEW ── */}
      {step === 'review' && (
        <div className="animate-fade-up">
          <Card glow="gold">
            <CardHeader title="Confirm Transfer" subtitle="Your wallet will ask you to sign" />
            <div className="space-y-3 mb-6">
              {[
                { label: 'From', value: truncateAddress(publicKey || '', 8) },
                { label: 'To', value: truncateAddress(destination, 8) },
                { label: 'Amount', value: `${formatAmount(amount)} XLM` },
                ...(idrEstimate ? [{ label: 'Est. IDR', value: idrEstimate }] : []),
                { label: 'Network Fee', value: `${FEE_ESTIMATE} XLM` },
                { label: 'Wallet', value: walletName || 'Unknown' },
                ...(memo ? [{ label: 'Memo', value: memo }] : []),
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0"
                >
                  <span className="text-sm text-text-muted">{label}</span>
                  <span className={cn(
                    'text-sm font-mono',
                    label === 'Est. IDR' ? 'text-accent-gold font-semibold' : 'text-text-primary'
                  )}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-gold/5 border border-accent-gold/15 mb-4">
              <Info className="w-4 h-4 text-accent-gold shrink-0" />
              <p className="text-xs text-accent-gold">
                {walletName} will open a popup to confirm the signature.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep('form')}>
                Edit
              </Button>
              <Button className="flex-1" loading={loading} onClick={handleSend}>
                {loading ? 'Waiting for signature...' : 'Sign & Send'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── SUCCESS ── */}
      {step === 'success' && txResult && (
        <div className="animate-fade-up">
          <Card glow="gold" className="text-center">
            <div className="flex flex-col items-center py-4">
              <div className="w-16 h-16 rounded-full bg-status-success/10 flex items-center justify-center mb-5">
                <CheckCircle2 className="w-8 h-8 text-status-success" />
              </div>
              <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
                Transfer Sent
              </h2>
              <p className="text-text-secondary text-sm mb-6">
                Confirmed on Stellar Testnet.
              </p>

              <div className="w-full glass-card rounded-xl p-4 mb-4 text-left space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Amount</span>
                  <span className="text-accent-gold font-semibold">
                    {formatAmount(txResult.amount)} XLM
                  </span>
                </div>
                {idrEstimate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Est. IDR Value</span>
                    <span className="text-accent-gold/80 text-xs">{idrEstimate}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Recipient</span>
                  <span className="font-mono text-text-secondary">
                    {truncateAddress(txResult.destination, 8)}
                  </span>
                </div>
                <div className="flex justify-between text-sm items-start gap-2">
                  <span className="text-text-muted shrink-0">Tx Hash</span>
                  <span className="font-mono text-text-secondary text-xs break-all text-right">
                    {txResult.hash}
                  </span>
                </div>
              </div>

              {/* Copy payment link — implemented based on Dedi Kurniawan feedback */}
              <button
                onClick={handleCopyPaymentLink}
                className="w-full flex items-center justify-center gap-2 py-2.5 mb-4 rounded-xl border border-white/[0.08] text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-all"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-status-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? 'Payment link copied!' : 'Copy payment link'}
              </button>

              <div className="flex gap-3 w-full">
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txResult.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="secondary"
                    className="w-full"
                    rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Explorer
                  </Button>
                </a>
                <Button className="flex-1" onClick={reset}>
                  New Transfer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
