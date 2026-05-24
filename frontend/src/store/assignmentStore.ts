'use client';

import { create } from 'zustand';
import { QuestionTypeSpec } from '@/types';
import { isValidDdMmYyyy } from '@/lib/utils';

export const QUESTION_TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Answer Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'True or False',
  'Fill in the Blanks',
] as const;

export interface FormErrors {
  title?: string;
  schoolName?: string;
  className?: string;
  subject?: string;
  dueDate?: string;
  questionTypes?: string;
}

interface AssignmentFormState {
  // identity / context fields (shown on the paper)
  title: string;
  schoolName: string;
  className: string;
  subject: string;

  dueDate: string;
  questionTypes: QuestionTypeSpec[];
  additionalInfo: string;

  fileName: string | null;
  sourceText: string;

  errors: FormErrors;

  // setters
  setField: (field: keyof AssignmentFormState, value: string) => void;
  addQuestionType: () => void;
  removeQuestionType: (index: number) => void;
  updateQuestionType: (index: number, patch: Partial<QuestionTypeSpec>) => void;
  setFile: (name: string | null, text: string) => void;

  // derived
  totalQuestions: () => number;
  totalMarks: () => number;

  validate: () => boolean;
  reset: () => void;
}

const initialQuestionTypes: QuestionTypeSpec[] = [
  { type: 'Multiple Choice Questions', count: 4, marks: 1 },
  { type: 'Short Questions', count: 3, marks: 2 },
];

export const useAssignmentForm = create<AssignmentFormState>((set, get) => ({
  title: 'Quiz on Electricity',
  schoolName: 'Delhi Public School, Sector-4, Bokaro',
  className: 'Class 5th',
  subject: 'English',
  dueDate: '',
  questionTypes: initialQuestionTypes.map((q) => ({ ...q })),
  additionalInfo: '',
  fileName: null,
  sourceText: '',
  errors: {},

  setField: (field, value) =>
    set((s) => ({ ...s, [field]: value, errors: { ...s.errors, [field]: undefined } })),

  addQuestionType: () =>
    set((s) => ({
      questionTypes: [
        ...s.questionTypes,
        { type: QUESTION_TYPE_OPTIONS[0], count: 1, marks: 1 },
      ],
      errors: { ...s.errors, questionTypes: undefined },
    })),

  removeQuestionType: (index) =>
    set((s) => ({ questionTypes: s.questionTypes.filter((_, i) => i !== index) })),

  updateQuestionType: (index, patch) =>
    set((s) => ({
      questionTypes: s.questionTypes.map((qt, i) =>
        i === index
          ? {
              ...qt,
              ...patch,
              // clamp to non-negative integers
              count: patch.count !== undefined ? Math.max(0, Math.floor(patch.count)) : qt.count,
              marks: patch.marks !== undefined ? Math.max(0, Math.floor(patch.marks)) : qt.marks,
            }
          : qt,
      ),
    })),

  setFile: (name, text) => set({ fileName: name, sourceText: text }),

  totalQuestions: () => get().questionTypes.reduce((sum, q) => sum + (q.count || 0), 0),
  totalMarks: () => get().questionTypes.reduce((sum, q) => sum + (q.count || 0) * (q.marks || 0), 0),

  validate: () => {
    const s = get();
    const errors: FormErrors = {};

    if (!s.title.trim()) errors.title = 'Title is required';
    if (!s.schoolName.trim()) errors.schoolName = 'School name is required';
    if (!s.className.trim()) errors.className = 'Class is required';
    if (!s.subject.trim()) errors.subject = 'Subject is required';

    if (!s.dueDate.trim()) errors.dueDate = 'Due date is required';
    else if (!isValidDdMmYyyy(s.dueDate)) errors.dueDate = 'Use DD-MM-YYYY format';

    if (s.questionTypes.length === 0) {
      errors.questionTypes = 'Add at least one question type';
    } else {
      const bad = s.questionTypes.some(
        (q) => !q.type.trim() || q.count <= 0 || q.marks <= 0,
      );
      if (bad) errors.questionTypes = 'Each row needs a type and positive count & marks';
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },

  reset: () =>
    set({
      dueDate: '',
      questionTypes: initialQuestionTypes.map((q) => ({ ...q })),
      additionalInfo: '',
      fileName: null,
      sourceText: '',
      errors: {},
    }),
}));
