import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary:
        'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] text-white shadow-[0_4px_16px_rgba(0,38,63,0.28)] hover:shadow-[0_6px_24px_rgba(0,38,63,0.38)] hover:-translate-y-0.5 active:scale-[0.98]',
      secondary:
        'bg-[var(--secondary-light)] text-[var(--secondary)] border border-[var(--secondary)]/20 hover:bg-[var(--secondary)] hover:text-white active:scale-[0.98]',
      ghost:
        'bg-transparent text-[var(--on-surface)] hover:bg-[var(--surface-low)] active:scale-[0.98]',
      outline:
        'bg-transparent border border-[var(--outline)] text-[var(--on-surface)] hover:bg-[var(--surface-low)] hover:border-[var(--secondary)] active:scale-[0.98]',
      danger:
        'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 active:scale-[0.98]',
      gold:
        'btn-gold active:scale-[0.98]',
    };

    const sizes = {
      sm:  'px-3.5 py-1.5 text-xs rounded-lg font-bold',
      md:  'px-5 py-2.5 text-sm rounded-xl font-bold',
      lg:  'px-7 py-3 text-base rounded-xl font-black',
      xl:  'px-10 py-4 text-base rounded-2xl font-black',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
