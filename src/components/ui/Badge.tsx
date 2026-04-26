import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'info' | 'outline';
  pulse?: boolean;
}

const Badge = ({ className, variant = 'primary', pulse, ...props }: BadgeProps) => {
  const variants = {
    primary: 'bg-[var(--primary-container)] text-white',
    secondary: 'bg-[var(--secondary)] text-white',
    tertiary: 'bg-[var(--tertiary)] text-[var(--tertiary-container)]',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-[var(--secondary-light)] text-[var(--secondary)]',
    outline: 'border border-[var(--outline-variant)] text-[var(--on-surface-variant)]',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        pulse && 'badge-pulse',
        className
      )}
      {...props}
    />
  );
};

export { Badge };
