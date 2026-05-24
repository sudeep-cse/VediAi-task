'use client';

import { X } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { NumberStepper } from '@/components/ui/NumberStepper';
import { QUESTION_TYPE_OPTIONS, useAssignmentForm } from '@/store/assignmentStore';
import { QuestionTypeSpec } from '@/types';

interface Props {
  index: number;
  row: QuestionTypeSpec;
}

export function QuestionTypeRow({ index, row }: Props) {
  const { updateQuestionType, removeQuestionType } = useAssignmentForm();

  return (
    <div className="rounded-xl border border-line/70 bg-white p-2 sm:border-0 sm:p-0">
      {/* Desktop: single aligned row */}
      <div className="hidden items-center gap-3 sm:flex">
        <div className="flex-1">
          <Select
            options={QUESTION_TYPE_OPTIONS}
            value={row.type}
            onChange={(e) => updateQuestionType(index, { type: e.target.value })}
          />
        </div>
        <button
          onClick={() => removeQuestionType(index)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-canvas hover:text-hard"
          aria-label="Remove question type"
        >
          <X className="h-4 w-4" />
        </button>
        <NumberStepper
          value={row.count}
          min={0}
          onChange={(v) => updateQuestionType(index, { count: v })}
        />
        <NumberStepper
          value={row.marks}
          min={0}
          onChange={(v) => updateQuestionType(index, { marks: v })}
        />
      </div>

      {/* Mobile: stacked card */}
      <div className="space-y-2.5 sm:hidden">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Select
              options={QUESTION_TYPE_OPTIONS}
              value={row.type}
              onChange={(e) => updateQuestionType(index, { type: e.target.value })}
            />
          </div>
          <button
            onClick={() => removeQuestionType(index)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-faint hover:text-hard"
            aria-label="Remove question type"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-canvas/60 px-3 py-2.5">
          <div className="text-center">
            <p className="mb-1 text-xs font-medium text-ink-muted">No. of Questions</p>
            <NumberStepper value={row.count} min={0} onChange={(v) => updateQuestionType(index, { count: v })} />
          </div>
          <div className="text-center">
            <p className="mb-1 text-xs font-medium text-ink-muted">Marks</p>
            <NumberStepper value={row.marks} min={0} onChange={(v) => updateQuestionType(index, { marks: v })} />
          </div>
        </div>
      </div>
    </div>
  );
}
