'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Send, Users, Clock, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { WalletButton } from '@/components/wallet/WalletButton';

const navItems = [
  { href: '/send', label: 'Send', icon: Send },
  { href: '/split', label: 'Split Bill', icon: Users },
  { href: '/history', label: 'History', icon: Clock },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-surface-DEFAULT/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-glow-gold"
            style={{ background: 'linear-gradient(135deg, #E8B86D 0%, #F5D08A 50%, #C9942E 100%)' }}>
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="#080C14">
              <path d="M10 2L2 7l8 5 8-5-8-5zM2 13l8 5 8-5M2 10l8 5 8-5" />
            </svg>
          </div>
          <span className="font-display font-bold text-base text-text-primary group-hover:text-accent-gold transition-colors">
            StellarPay
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body transition-all duration-200',
                pathname === href
                  ? 'bg-accent-gold/10 text-accent-gold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          <WalletButton />
          <button
            className="md:hidden p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-all"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06] px-4 py-3 space-y-1 bg-surface-DEFAULT/95 backdrop-blur-xl">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-body transition-all',
                pathname === href
                  ? 'bg-accent-gold/10 text-accent-gold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

export default Navbar;
