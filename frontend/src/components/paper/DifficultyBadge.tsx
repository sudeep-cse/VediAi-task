import { Difficulty } from '@/types';
import { cn } from '@/lib/utils';

const STYLES: Record<Difficulty, { label: string; className: string }> = {
  easy: { label: 'Easy', className: 'bg-easy/10 text-easy ring-easy/20' },
  moderate: { label: 'Moderate', className: 'bg-moderate/10 text-moderate ring-moderate/20' },
  hard: { label: 'Hard', className: 'bg-hard/10 text-hard ring-hard/20' },
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const s = STYLES[difficulty];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
        s.className,
      )}
    >
      {s.label}
    </span>
  );
}
