'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function NumberStepper({ value, onChange, min = 0, max = 999, className }: NumberStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <div
      className={cn(
        'inline-flex h-11 items-center gap-1 rounded-xl border border-line bg-white px-1.5',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-canvas hover:text-ink disabled:opacity-40"
        disabled={value <= min}
        aria-label="Decrease"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
        className="w-9 bg-transparent text-center text-sm font-semibold text-ink focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
        aria-label="Increase"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
