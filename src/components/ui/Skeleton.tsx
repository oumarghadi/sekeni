import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text';
}

export function Skeleton({ className, variant = 'rect', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[var(--surface-high)]",
        variant === 'circle' && "rounded-full",
        variant === 'rect' && "rounded-2xl",
        variant === 'text' && "rounded-md h-4 w-full",
        className
      )}
      {...props}
    />
  );
}
