'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle2, ExternalLink, Wallet, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatAmount } from '@/lib/stellar';
import toast from 'react-hot-toast';

// In production, fetch payment link data from on-chain / database by ID
const MOCK_PAYMENT = {
  id: 'demo-link',
  from: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
  amount: '10.00',
  asset: 'USDC',
  memo: 'Payment for freelance work',
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
};

type Step = 'landing' | 'connect' | 'confirm' | 'success';

export default function PayLinkPage() {
  const params = useParams();
  const id = params.id as string;

  const payment = MOCK_PAYMENT;
  const [step, setStep] = useState<Step>('landing');
  const [paying, setPaying] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleAlbedo = async () => {
    setStep('connect');
    await new Promise((r) => setTimeout(r, 800));
    setStep('confirm');
  };

  const handlePay = async () => {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 2200));
    const hash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setTxHash(hash);
    setStep('success');
    setPaying(false);
    toast.success('Payment complete!');
  };

  return (
    <div className="min-h-screen bg-surface-DEFAULT flex flex-col items-center justify-center px-4">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(232,184,109,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8 relative z-10">
        <div className="w-7 h-7 rounded-lg bg-gold-gradient flex items-center justify-center shadow-glow-gold">
          <svg viewBox="0 0 20 20" className="w-4 h-4 fill-surface-DEFAULT">
            <path d="M10 2L2 7l8 5 8-5-8-5zM2 13l8 5 8-5M2 10l8 5 8-5" />
          </svg>
        </div>
        <span className="font-display font-bold text-base text-text-primary">StellarPay</span>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {step === 'landing' && (
          <Card glow="gold" className="animate-fade-up">
            <div className="text-center mb-6">
              <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Payment Request</p>
              <p className="font-display font-bold text-4xl text-text-primary mt-2">
                {formatAmount(payment.amount)}{' '}
                <span className="text-accent-gold">{payment.asset}</span>
              </p>
              {payment.memo && (
                <p className="text-sm text-text-secondary mt-2 font-body">"{payment.memo}"</p>
              )}
            </div>

            <div className="space-y-2.5 mb-6">
              {[
                { icon: Zap, text: 'Settles in under 5 seconds' },
                { icon: Shield, text: 'No wallet installation required' },
                { icon: Wallet, text: 'Works with Albedo web wallet' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <Icon className="w-4 h-4 text-accent-gold shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            <Button className="w-full" size="lg" onClick={handleAlbedo}>
              Pay with Albedo
            </Button>
            <p className="text-xs text-text-muted text-center mt-3 font-body">
              Albedo is a browser-based Stellar wallet — no install needed.
            </p>
          </Card>
        )}

        {step === 'connect' && (
          <Card className="animate-fade-up text-center py-10">
            <div className="w-12 h-12 rounded-full border-2 border-accent-gold/40 border-t-accent-gold animate-spin mx-auto mb-4" />
            <p className="text-text-secondary font-body text-sm">Connecting to Albedo...</p>
          </Card>
        )}

        {step === 'confirm' && (
          <Card glow="gold" className="animate-fade-up">
            <h2 className="font-display font-semibold text-lg text-text-primary mb-5">
              Confirm Payment
            </h2>
            <div className="space-y-3 mb-6">
              {[
                { label: 'Amount', value: `${formatAmount(payment.amount)} USDC` },
                { label: 'To', value: `${payment.from.slice(0, 8)}...${payment.from.slice(-8)}` },
                ...(payment.memo ? [{ label: 'Memo', value: payment.memo }] : []),
                { label: 'Fee', value: '~$0.001' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-white/[0.04] last:border-0 text-sm">
                  <span className="text-text-muted">{label}</span>
                  <span className="text-text-primary font-mono text-xs">{value}</span>
                </div>
              ))}
            </div>
            <Button className="w-full" size="lg" loading={paying} onClick={handlePay}>
              {paying ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </Card>
        )}

        {step === 'success' && (
          <Card glow="gold" className="animate-fade-up text-center">
            <div className="py-4">
              <div className="w-16 h-16 rounded-full bg-status-success/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-status-success" />
              </div>
              <h2 className="font-display font-bold text-2xl text-text-primary mb-2">Payment Sent</h2>
              <p className="text-text-secondary text-sm mb-6">
                {formatAmount(payment.amount)} USDC delivered in under 5 seconds.
              </p>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" className="w-full" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                  View on Explorer
                </Button>
              </a>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
