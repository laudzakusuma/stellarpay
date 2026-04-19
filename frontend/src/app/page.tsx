import Link from 'next/link';
import { Send, Users, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const stats = [
  { label: 'Transaction Time', value: '< 5s', sub: 'Stellar finality' },
  { label: 'Fee per Transfer', value: '$0.001', sub: 'vs $15–30 traditional' },
  { label: 'Market Opportunity', value: '$8.9B', sub: 'Remittance to Indonesia' },
  { label: 'Networks Supported', value: '150+', sub: 'Countries via Anchors' },
];

const features = [
  {
    icon: Send,
    title: 'Instant Remittance',
    desc: 'Send USDC to any Stellar address or phone number. Path payment auto-converts XLM to USDC to local currency.',
    href: '/send',
    cta: 'Send Money',
    accent: 'gold',
  },
  {
    icon: Users,
    title: 'On-chain Split Bill',
    desc: 'Create a group bill, invite members, and the smart contract automatically releases funds once everyone has paid.',
    href: '/split',
    cta: 'Split a Bill',
    accent: 'cyan',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-DEFAULT">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(232,184,109,0.06) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(56,189,248,0.04) 0%, transparent 60%)',
        }}
      />

      {/* Nav */}
      <header className="relative z-10 border-b border-white/[0.06] bg-surface-DEFAULT/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gold-gradient flex items-center justify-center shadow-glow-gold">
              <svg viewBox="0 0 20 20" className="w-4 h-4 fill-surface-DEFAULT">
                <path d="M10 2L2 7l8 5 8-5-8-5zM2 13l8 5 8-5M2 10l8 5 8-5" />
              </svg>
            </div>
            <span className="font-display font-bold text-base text-text-primary">StellarPay</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/send">
              <Button variant="secondary" size="sm">Launch App</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <section className="pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-xs font-medium mb-8 animate-fade-up">
            <Zap className="w-3 h-3" />
            Built on Stellar Testnet — Soroban Smart Contracts
          </div>

          <h1 className="animate-fade-up stagger-1 font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-text-primary leading-[1.1] tracking-tight mb-6">
            Money moves at the
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #E8B86D 0%, #F5D08A 50%, #38BDF8 100%)',
              }}
            >
              speed of Stellar
            </span>
          </h1>

          <p className="animate-fade-up stagger-2 text-lg sm:text-xl text-text-secondary font-body max-w-2xl mx-auto mb-10 leading-relaxed">
            Send USDC anywhere in the world in under 5 seconds for less than $0.001.
            Split bills transparently with Soroban smart contracts.
          </p>

          <div className="animate-fade-up stagger-3 flex items-center justify-center gap-4 flex-wrap">
            <Link href="/send">
              <Button size="lg" leftIcon={<Send className="w-4 h-4" />}>
                Send Money Now
              </Button>
            </Link>
            <Link href="/split">
              <Button variant="secondary" size="lg" leftIcon={<Users className="w-4 h-4" />}>
                Split a Bill
              </Button>
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`glass-card rounded-2xl p-5 text-center animate-fade-up stagger-${i + 1}`}
            >
              <p className="font-display font-bold text-2xl text-accent-gold">{s.value}</p>
              <p className="text-sm font-medium text-text-primary mt-1">{s.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{s.sub}</p>
            </div>
          ))}
        </section>

        {/* Feature cards */}
        <section className="grid md:grid-cols-2 gap-6 mb-20">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="group" padding="lg">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                    f.accent === 'gold'
                      ? 'bg-accent-gold/10 text-accent-gold'
                      : 'bg-accent-cyan/10 text-accent-cyan'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-xl text-text-primary mb-3">
                  {f.title}
                </h3>
                <p className="text-text-secondary font-body text-sm leading-relaxed mb-6">
                  {f.desc}
                </p>
                <Link href={f.href}>
                  <Button
                    variant={f.accent === 'gold' ? 'primary' : 'secondary'}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {f.cta}
                  </Button>
                </Link>
              </Card>
            );
          })}
        </section>

        {/* Why Stellar */}
        <section className="mb-24">
          <h2 className="font-display font-bold text-3xl text-text-primary text-center mb-12">
            Why Stellar?
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: '5-Second Finality',
                desc: 'Transactions confirm in seconds, not minutes or hours.',
              },
              {
                icon: Shield,
                title: 'Sub-cent Fees',
                desc: 'Every transaction costs fractions of a cent — not $15–30.',
              },
              {
                icon: Globe,
                title: 'Global Anchor Network',
                desc: 'Off-ramp directly to local bank accounts via Stellar Anchors.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="glass-card rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-accent-gold/10 text-accent-gold flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-text-primary mb-2">{item.title}</h3>
                  <p className="text-sm text-text-secondary font-body leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
