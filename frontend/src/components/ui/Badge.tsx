import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'error' | 'warning' | 'pending' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-status-success/10 text-status-success border-status-success/20',
  error: 'bg-status-error/10 text-status-error border-status-error/20',
  warning: 'bg-status-warning/10 text-status-warning border-status-warning/20',
  pending: 'bg-status-pending/10 text-status-pending border-status-pending/20',
  neutral: 'bg-white/[0.05] text-text-secondary border-white/[0.08]',
};

const dotStyles: Record<BadgeVariant, string> = {
  success: 'bg-status-success',
  error: 'bg-status-error',
  warning: 'bg-status-warning',
  pending: 'bg-status-pending',
  neutral: 'bg-text-muted',
};

export function Badge({ variant = 'neutral', children, dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotStyles[variant])}
        />
      )}
      {children}
    </span>
  );
}

export function StatusDot({ variant }: { variant: BadgeVariant }) {
  return (
    <span
      className={cn(
        'inline-block w-2 h-2 rounded-full',
        variant === 'pending' && 'animate-pulse',
        dotStyles[variant],
      )}
    />
  );
}
