'use client';

import { create } from 'zustand';
import { JobStatus, StructuredPaper } from '@/types';

interface PaperState {
  paperId: string | null;
  status: JobStatus;
  progress: number;
  message: string;
  error: string | null;
  paper: StructuredPaper | null;

  setPaperId: (id: string | null) => void;
  setProgress: (status: JobStatus, progress: number, message?: string) => void;
  setCompleted: (paper: StructuredPaper) => void;
  setFailed: (error: string) => void;
  reset: () => void;
}

export const usePaperStore = create<PaperState>((set) => ({
  paperId: null,
  status: 'queued',
  progress: 0,
  message: 'Queued for generation',
  error: null,
  paper: null,

  setPaperId: (id) => set({ paperId: id }),

  setProgress: (status, progress, message) =>
    set((s) => ({ status, progress, message: message ?? s.message, error: null })),

  setCompleted: (paper) =>
    set({ status: 'completed', progress: 100, paper, message: 'Completed', error: null }),

  setFailed: (error) => set({ status: 'failed', error, message: 'Generation failed' }),

  reset: () =>
    set({
      status: 'queued',
      progress: 0,
      message: 'Queued for generation',
      error: null,
      paper: null,
    }),
}));
