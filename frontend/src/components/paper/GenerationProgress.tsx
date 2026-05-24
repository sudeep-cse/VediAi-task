'use client';

import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { JobStatus } from '@/types';
import { Button } from '@/components/ui/Button';

interface Props {
  status: JobStatus;
  progress: number;
  message: string;
  error: string | null;
  onRetry?: () => void;
}

const STAGES = [
  { at: 10, label: 'Queued for generation' },
  { at: 25, label: 'Building structured prompt' },
  { at: 50, label: 'Generating questions with AI' },
  { at: 80, label: 'Parsing & structuring the paper' },
  { at: 100, label: 'Finishing up' },
];

export function GenerationProgress({ status, progress, message, error, onRetry }: Props) {
  if (status === 'failed') {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-card">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-hard/10 text-hard">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h3 className="mt-4 text-lg font-bold text-ink">Generation failed</h3>
        <p className="mt-1.5 text-sm text-ink-muted">{error ?? 'Something went wrong.'}</p>
        {onRetry && (
          <Button className="mt-5" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-8 shadow-card animate-fade-up">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-bold text-ink">Generating your question paper</h3>
          <p className="text-sm text-ink-muted">This usually takes a few seconds.</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-ink-soft">
          <span className="flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
            {message}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>
      </div>

      <ul className="mt-6 space-y-2">
        {STAGES.map((s) => {
          const done = progress >= s.at;
          const active = !done && progress >= s.at - 25;
          return (
            <li key={s.at} className="flex items-center gap-2.5 text-sm">
              <span
                className={[
                  'flex h-4 w-4 items-center justify-center rounded-full text-[10px]',
                  done ? 'bg-easy text-white' : active ? 'bg-accent text-white' : 'bg-line text-ink-faint',
                ].join(' ')}
              >
                {done ? '✓' : ''}
              </span>
              <span className={done ? 'text-ink-soft' : 'text-ink-faint'}>{s.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
