'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Eye, Trash2 } from 'lucide-react';
import { AssignmentSummary } from '@/types';
import { formatDate } from '@/lib/utils';

interface Props {
  assignment: AssignmentSummary;
  onView: (a: AssignmentSummary) => void;
  onDelete: (a: AssignmentSummary) => void;
}

export function AssignmentCard({ assignment, onView, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-card transition-shadow hover:shadow-soft">
      <div className="flex items-start justify-between">
        <button
          onClick={() => onView(assignment)}
          className="text-left text-base font-bold text-ink underline-offset-4 hover:underline"
        >
          {assignment.title}
        </button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-canvas hover:text-ink"
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {open && (
            <div className="absolute right-0 top-9 z-10 w-44 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-soft animate-fade-up">
              <button
                onClick={() => {
                  setOpen(false);
                  onView(assignment);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink-soft hover:bg-canvas"
              >
                <Eye className="h-4 w-4" /> View Assignment
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onDelete(assignment);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-hard hover:bg-hard/5"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-ink-muted">
        <span className="rounded-md bg-canvas px-2 py-1 font-medium">{assignment.subject}</span>
        <span className="rounded-md bg-canvas px-2 py-1 font-medium">{assignment.className}</span>
        <span className="rounded-md bg-canvas px-2 py-1 font-medium">{assignment.totalMarks} marks</span>
      </div>

      <div className="mt-5 flex items-center justify-between text-xs">
        <span className="text-ink-muted">
          Assigned on : <span className="font-semibold text-ink-soft">{formatDate(assignment.createdAt)}</span>
        </span>
        <span className="text-ink-muted">
          Due : <span className="font-semibold text-ink-soft">{formatDate(assignment.dueDate)}</span>
        </span>
      </div>
    </div>
  );
}
