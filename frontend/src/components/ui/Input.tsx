'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const baseField =
  'w-full rounded-xl border bg-white px-3.5 text-sm text-ink placeholder:text-ink-faint ' +
  'transition-colors focus:outline-none focus:border-accent-ring focus:ring-2 focus:ring-accent-ring/30';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, trailing, ...props }, ref) => (
    <div className="relative">
      <input
        ref={ref}
        className={cn(
          baseField,
          'h-11',
          trailing && 'pr-11',
          error ? 'border-hard focus:border-hard focus:ring-hard/20' : 'border-line',
          className,
        )}
        {...props}
      />
      {trailing && (
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</span>
      )}
    </div>
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(baseField, 'min-h-[88px] py-3 leading-relaxed border-line resize-y', className)}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export function FieldLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <label className={cn('mb-1.5 block text-sm font-semibold text-ink-soft', className)}>
      {children}
    </label>
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs font-medium text-hard">{children}</p>;
}
