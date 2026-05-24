import { cn } from '@/lib/utils';

/** Two-segment progress bar with a leading status dot (matches the Figma). */
export function Stepper({ step = 1, total = 2 }: { step?: number; total?: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-easy ring-4 ring-easy/15" />
      <div className="flex flex-1 gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i < step ? 'bg-ink' : 'bg-line',
            )}
          />
        ))}
      </div>
    </div>
  );
}
