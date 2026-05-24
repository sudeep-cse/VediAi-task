import { z } from 'zod';
import {
  AssignmentInput,
  Difficulty,
  ParsedSection,
  StructuredPaper,
} from '../types';

/**
 * We validate the model output against a strict schema. If the model wraps the
 * JSON in prose or code fences, we extract the first balanced JSON object first.
 */

const difficultyEnum = z.enum(['easy', 'moderate', 'hard']);

const questionSchema = z.object({
  text: z.string().min(1),
  difficulty: z.union([difficultyEnum, z.string()]).transform(normalizeDifficulty),
  marks: z.coerce.number().nonnegative(),
  answer: z.string().optional().default(''),
});

const sectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  instruction: z.string().optional().default(''),
  questions: z.array(questionSchema).min(1),
});

const rawPaperSchema = z.object({
  intro: z.string().optional().default(''),
  timeAllowed: z.string().optional().default('1 hour'),
  generalInstructions: z
    .string()
    .optional()
    .default('All questions are compulsory unless stated otherwise.'),
  sections: z.array(sectionSchema).min(1),
});

function normalizeDifficulty(value: string): Difficulty {
  const v = value.toLowerCase().trim();
  if (v.startsWith('eas')) return 'easy';
  if (v.startsWith('hard') || v.startsWith('chall') || v.startsWith('diff')) return 'hard';
  return 'moderate';
}

/** Extracts the first balanced JSON object from an arbitrary string. */
export function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;

  const start = candidate.indexOf('{');
  if (start === -1) throw new Error('No JSON object found in model response');

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < candidate.length; i++) {
    const ch = candidate[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return candidate.slice(start, i + 1);
    }
  }
  throw new Error('Unbalanced JSON in model response');
}

/**
 * Parse raw model text into a fully structured, numbered, totalled paper.
 * Throws if the response cannot be validated.
 */
export function parsePaper(rawText: string, input: AssignmentInput): StructuredPaper {
  const json = JSON.parse(extractJson(rawText));
  const parsed = rawPaperSchema.parse(json);

  let runningNumber = 0;
  let totalMarks = 0;
  let totalQuestions = 0;

  const sections: ParsedSection[] = parsed.sections.map((section, idx) => {
    const id = (section.id?.trim() || String.fromCharCode(65 + idx)).toUpperCase();
    const questions = section.questions.map((q) => {
      runningNumber += 1;
      totalQuestions += 1;
      totalMarks += q.marks;
      return {
        number: runningNumber,
        text: q.text.trim(),
        difficulty: q.difficulty,
        marks: q.marks,
        answer: q.answer?.trim() || '',
      };
    });
    return {
      id,
      title: section.title.trim(),
      instruction: section.instruction.trim(),
      questions,
    };
  });

  return {
    schoolName: input.schoolName,
    subject: input.subject,
    className: input.className,
    timeAllowed: parsed.timeAllowed,
    maximumMarks: totalMarks,
    generalInstructions: parsed.generalInstructions,
    intro:
      parsed.intro.trim() ||
      `Here is your customized question paper for ${input.subject} (${input.className}).`,
    sections,
    totalQuestions,
    totalMarks,
  };
}
