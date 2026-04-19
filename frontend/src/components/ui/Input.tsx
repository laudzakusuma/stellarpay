'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftAddon, rightAddon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-text-secondary uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3 flex items-center text-text-muted pointer-events-none">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-4 py-3 rounded-xl bg-surface-2 border text-text-primary placeholder:text-text-muted font-body text-sm',
              'focus:outline-none focus:ring-1 transition-all duration-200',
              error
                ? 'border-status-error/40 focus:border-status-error/60 focus:ring-status-error/20'
                : 'border-white/[0.06] focus:border-accent-gold/40 focus:ring-accent-gold/20',
              leftAddon && 'pl-10',
              rightAddon && 'pr-10',
              className,
            )}
            {...props}
          />
          {rightAddon && (
            <div className="absolute right-3 flex items-center">{rightAddon}</div>
          )}
        </div>
        {error && <p className="text-xs text-status-error">{error}</p>}
        {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export { Input };
