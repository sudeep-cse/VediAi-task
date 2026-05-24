export type Difficulty = 'easy' | 'moderate' | 'hard';
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface QuestionTypeSpec {
  type: string;
  count: number;
  marks: number;
}

export interface AssignmentInput {
  title: string;
  schoolName: string;
  className: string;
  subject: string;
  dueDate: string;
  questionTypes: QuestionTypeSpec[];
  additionalInfo?: string;
  sourceText?: string;
}

export interface ParsedQuestion {
  number: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
  answer?: string;
}

export interface ParsedSection {
  id: string;
  title: string;
  instruction: string;
  questions: ParsedQuestion[];
}

export interface StructuredPaper {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
  generalInstructions: string;
  intro: string;
  sections: ParsedSection[];
  totalQuestions: number;
  totalMarks: number;
}

export interface AssignmentSummary {
  _id: string;
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  totalQuestions: number;
  totalMarks: number;
  createdAt: string;
  latestPaper?: string;
}

export interface CreateAssignmentResponse {
  assignmentId: string;
  paperId: string;
  jobId: string;
}

export interface PaperStatusPayload {
  status: JobStatus;
  progress: number;
  message?: string;
  error?: string;
}
