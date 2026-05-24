// Shared domain types used across controllers, services, queues and workers.

export type Difficulty = 'easy' | 'moderate' | 'hard';

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

/** A single question-type row coming from the create-assignment form. */
export interface QuestionTypeSpec {
  type: string; // e.g. "Multiple Choice Questions"
  count: number; // No. of Questions
  marks: number; // Marks per question
}

/** Payload submitted by the Create Assignment form. */
export interface AssignmentInput {
  title: string;
  schoolName: string;
  className: string;
  subject: string;
  dueDate: string; // ISO or DD-MM-YYYY
  questionTypes: QuestionTypeSpec[];
  additionalInfo?: string;
  // Optional uploaded source material (extracted text). Kept small on purpose.
  sourceText?: string;
}

/** A single parsed question in the generated paper. */
export interface ParsedQuestion {
  number: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
  answer?: string;
}

/** A parsed section (A, B, C ...). */
export interface ParsedSection {
  id: string; // "A", "B", ...
  title: string; // e.g. "Short Answer Questions"
  instruction: string; // e.g. "Attempt all questions. Each carries 2 marks"
  questions: ParsedQuestion[];
}

/** The fully structured exam paper (never raw AI text). */
export interface StructuredPaper {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
  generalInstructions: string;
  intro: string; // friendly header line shown in the dark banner
  sections: ParsedSection[];
  totalQuestions: number;
  totalMarks: number;
}

export interface GenerationJobData {
  paperId: string;
  assignmentId: string;
  input: AssignmentInput;
}
