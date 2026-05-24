'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'create';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  // black pill — primary action (Next, Create Assignment floating)
  primary:
    'bg-ink text-white hover:bg-black shadow-sm disabled:opacity-50',
  // white with border — secondary (Previous)
  secondary:
    'bg-white text-ink border border-line hover:bg-canvas disabled:opacity-50',
  ghost: 'text-ink-soft hover:bg-canvas',
  accent: 'bg-accent text-white hover:bg-[#d8460f] shadow-sm',
  // black pill with orange glow — sidebar "Create Assignment"
  create:
    'bg-ink text-white shadow-glow hover:bg-black',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold',
        'transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring/60',
        'disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
