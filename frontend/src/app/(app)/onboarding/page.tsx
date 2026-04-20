'use client';

import Link from 'next/link';
import {
  Wallet, Send, Users, CheckCircle2, ArrowRight,
  ExternalLink, Gift, Zap, Shield
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const steps = [
  {
    num: '01',
    icon: Wallet,
    title: 'Get a Testnet Wallet',
    desc: 'Install Freighter browser extension or use Albedo (no install needed).',
    action: { label: 'Install Freighter', href: 'https://www.freighter.app/' },
    alt: { label: 'Use Albedo instead', href: 'https://albedo.link/' },
  },
  {
    num: '02',
    icon: Gift,
    title: 'Fund with Testnet XLM',
    desc: 'Get free testnet XLM from Stellar Friendbot — no real money needed.',
    action: { label: 'Open Friendbot', href: 'https://friendbot.stellar.org' },
  },
  {
    num: '03',
    icon: Send,
    title: 'Try Sending USDC',
    desc: 'Send USDC to any Stellar address in under 5 seconds for less than $0.001.',
    action: { label: 'Go to Send', href: '/send' },
    internal: true,
  },
  {
    num: '04',
    icon: Users,
    title: 'Split a Bill',
    desc: 'Create a group bill. Smart contract auto-releases funds when all members pay.',
    action: { label: 'Try Split Bill', href: '/split' },
    internal: true,
  },
  {
    num: '05',
    icon: CheckCircle2,
    title: 'Leave Feedback',
    desc: 'Tell us what you think! Fill in our short feedback form.',
    action: { label: 'Fill Form', href: 'https://forms.gle/REPLACE_FORM_LINK' },
  },
];

const faqs = [
  {
    q: 'Is this using real money?',
    a: 'No. StellarPay runs on Stellar Testnet — all assets are worthless test tokens. Safe to experiment.',
  },
  {
    q: 'What wallet should I use?',
    a: 'Albedo is the easiest — it works in your browser with zero installation. Freighter is great if you want a full wallet extension.',
  },
  {
    q: 'How do I get testnet USDC?',
    a: 'After getting testnet XLM from Friendbot, you can get USDC from the Stellar testnet anchor or ask us directly.',
  },
  {
    q: 'How fast are transactions?',
    a: 'Stellar confirms transactions in 3-5 seconds with fees under $0.001 — compared to minutes and $15+ on traditional rails.',
  },
];

export default function OnboardingPage() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-10 animate-fade-up text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-xs font-medium mb-5">
          <Zap className="w-3 h-3" />
          Stellar Testnet — No real funds needed
        </div>
        <h1 className="font-display font-bold text-4xl text-text-primary mb-3">
          Get Started in 5 Minutes
        </h1>
        <p className="text-text-secondary font-body text-base leading-relaxed">
          No crypto experience needed. Follow these steps to try StellarPay
          and experience borderless payments on Stellar.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-12">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className={`animate-fade-up stagger-${i + 1}`}
            >
              <Card padding="md" className="group">
                <div className="flex gap-4">
                  {/* Step number */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-accent-gold" />
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px flex-1 bg-white/[0.06] min-h-[20px]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-text-muted">{step.num}</span>
                      <h3 className="font-display font-semibold text-text-primary">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-text-secondary font-body mb-3 leading-relaxed">
                      {step.desc}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {step.internal ? (
                        <Link href={step.action.href}>
                          <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                            {step.action.label}
                          </Button>
                        </Link>
                      ) : (
                        <a href={step.action.href} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                            {step.action.label}
                          </Button>
                        </a>
                      )}
                      {step.alt && (
                        <a
                          href={step.alt.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-text-muted hover:text-text-secondary transition-colors underline underline-offset-2"
                        >
                          {step.alt.label}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mb-10 animate-fade-up">
        <h2 className="font-display font-bold text-xl text-text-primary mb-5">
          Common Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <Card key={faq.q} padding="md">
              <p className="font-display font-semibold text-sm text-text-primary mb-1.5">
                {faq.q}
              </p>
              <p className="text-sm text-text-secondary font-body leading-relaxed">
                {faq.a}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card glow="gold" className="text-center animate-fade-up" padding="lg">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-accent-gold" />
          <p className="font-display font-semibold text-text-primary">
            Ready to try?
          </p>
        </div>
        <p className="text-sm text-text-secondary mb-5 font-body">
          Connect your wallet and make your first transaction in under 5 minutes.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/send">
            <Button leftIcon={<Send className="w-4 h-4" />}>
              Send USDC
            </Button>
          </Link>
          <Link href="/split">
            <Button variant="secondary" leftIcon={<Users className="w-4 h-4" />}>
              Split a Bill
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
