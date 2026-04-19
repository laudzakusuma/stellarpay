'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-display font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 select-none';

    const variants = {
      primary:
        'rounded-xl bg-gold-gradient text-surface-DEFAULT shadow-glow-gold hover:brightness-110 hover:-translate-y-px active:translate-y-0 active:brightness-95',
      secondary:
        'rounded-xl bg-surface-2 border border-white/[0.08] text-text-primary hover:bg-surface-3 hover:border-white/[0.14]',
      ghost: 'rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.04]',
      danger:
        'rounded-xl bg-status-error/10 border border-status-error/20 text-status-error hover:bg-status-error/20',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-5 text-sm',
      lg: 'h-12 px-7 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
export { Button };
