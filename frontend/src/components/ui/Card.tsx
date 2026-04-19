import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'gold' | 'cyan' | 'none';
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export function Card({
  children,
  className,
  hover = false,
  glow = 'none',
  padding = 'md',
}: CardProps) {
  const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-8', none: '' };
  const glows = {
    gold: 'shadow-glow-gold',
    cyan: 'shadow-glow-cyan',
    none: 'shadow-card',
  };

  return (
    <div
      className={cn(
        'rounded-2xl glass-card',
        paddings[padding],
        glows[glow],
        hover &&
          'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-lg font-display font-semibold text-text-primary">{title}</h2>
        {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
