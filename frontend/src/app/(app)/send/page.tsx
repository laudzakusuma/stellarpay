'use client';

import { useState, useCallback } from 'react';
import { Send, AlertCircle, CheckCircle2, ArrowDown, Info, ExternalLink } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
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

const FEE_ESTIMATE = '0.00001';

export default function SendPage() {
  const { publicKey, isConnected } = useWalletStore();

  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<TxResult | null>(null);

  // Form state
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [destError, setDestError] = useState('');

  const validateDest = useCallback((val: string) => {
    if (!val) { setDestError('Destination is required'); return false; }
    if (!isValidStellarAddress(val)) { setDestError('Invalid Stellar address'); return false; }
    setDestError('');
    return true;
  }, []);

  const handleReview = () => {
    if (!validateDest(destination)) return;
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setStep('review');
  };

  const handleSend = async () => {
    if (!isConnected || !publicKey) {
      toast.error('Connect your wallet first');
      return;
    }
    setLoading(true);
    try {
      // In production: build tx → sign via wallet kit → submit to Horizon
      // Simulate for demo purposes
      await new Promise((r) => setTimeout(r, 2200));

      const mockHash = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      ).join('');

      setTxResult({ hash: mockHash, amount, destination });
      setStep('success');
      toast.success('Transaction submitted!');
    } catch (err: any) {
      toast.error(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('form');
    setDestination('');
    setAmount('');
    setMemo('');
    setTxResult(null);
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Page header */}
      <div className="mb-8 animate-fade-up">
        <h1 className="font-display font-bold text-3xl text-text-primary">Send USDC</h1>
        <p className="text-text-secondary font-body text-sm mt-1.5">
          Instant borderless transfers on Stellar Testnet
        </p>
      </div>

      {step === 'form' && (
        <div className="space-y-4 animate-fade-up stagger-1">
          {/* Wallet warning */}
          {!isConnected && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-status-warning/10 border border-status-warning/20">
              <AlertCircle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
              <p className="text-sm text-status-warning font-body">
                Connect your wallet to send transactions.
              </p>
            </div>
          )}

          <Card>
            <CardHeader title="Transfer Details" />

            <div className="space-y-5">
              {/* Destination */}
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

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 pr-20 rounded-xl bg-surface-2 border border-white/[0.06] text-text-primary placeholder:text-text-muted font-body text-sm focus:outline-none focus:border-accent-gold/40 focus:ring-1 focus:ring-accent-gold/20 transition-all duration-200"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-blue-400">$</span>
                    </div>
                    <span className="text-sm font-semibold text-text-secondary">USDC</span>
                  </div>
                </div>
              </div>

              {/* Path payment info */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-accent-cyan/5 border border-accent-cyan/15">
                <Info className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-accent-cyan">Path Payment Active</p>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                    Stellar automatically routes XLM through the best path to deliver USDC to
                    your recipient.
                  </p>
                </div>
              </div>

              {/* Memo */}
              <Input
                label="Memo (optional)"
                placeholder="Payment for invoice #001"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                hint="Max 28 characters — visible on-chain"
              />

              {/* Fee estimate */}
              <div className="flex items-center justify-between py-3 border-t border-white/[0.06] text-sm">
                <span className="text-text-muted font-body">Estimated Fee</span>
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

      {step === 'review' && (
        <div className="space-y-4 animate-fade-up">
          <Card glow="gold">
            <CardHeader title="Confirm Transfer" subtitle="Review details before sending" />

            <div className="space-y-3 mb-6">
              {[
                { label: 'From', value: truncateAddress(publicKey || 'Not connected', 8) },
                { label: 'To', value: truncateAddress(destination, 8) },
                { label: 'Amount', value: `${formatAmount(amount)} USDC` },
                { label: 'Network Fee', value: `${FEE_ESTIMATE} XLM (~$0.001)` },
                ...(memo ? [{ label: 'Memo', value: memo }] : []),
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0"
                >
                  <span className="text-sm text-text-muted font-body">{label}</span>
                  <span className="text-sm text-text-primary font-mono">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep('form')}>
                Edit
              </Button>
              <Button className="flex-1" size="md" loading={loading} onClick={handleSend}>
                {loading ? 'Sending...' : 'Confirm & Send'}
              </Button>
            </div>
          </Card>
        </div>
      )}

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
                Your USDC is on its way to the recipient.
              </p>

              <div className="w-full glass-card rounded-xl p-4 mb-6 text-left space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Amount</span>
                  <span className="text-accent-gold font-semibold">
                    {formatAmount(txResult.amount)} USDC
                  </span>
                </div>
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
