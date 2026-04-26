import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-[var(--on-surface-variant)] mr-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[var(--on-surface-variant)] group-focus-within:text-[var(--secondary)] transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-[var(--surface-low)] border-none rounded-xl py-3 px-4 text-[var(--on-surface)] transition-all',
              'focus:bg-white focus:ring-2 focus:ring-[var(--secondary)]/20 shadow-sm',
              'placeholder:text-[var(--on-surface-variant)]/50',
              icon && 'pr-12',
              error && 'ring-2 ring-red-500/50',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 mr-1 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
