import { AssignmentInput } from '../types';

/**
 * The JSON schema we force the model to follow. The model must return ONLY a
 * JSON object matching this shape so we can parse + validate it (we never
 * render raw model text).
 */
export const RESPONSE_SCHEMA = `{
  "intro": string,                       // one friendly sentence, e.g. "Here is your customized question paper..."
  "timeAllowed": string,                 // e.g. "45 minutes"
  "generalInstructions": string,         // e.g. "All questions are compulsory unless stated otherwise."
  "sections": [
    {
      "id": string,                      // "A", "B", "C" ...
      "title": string,                   // e.g. "Short Answer Questions"
      "instruction": string,             // e.g. "Attempt all questions. Each question carries 2 marks."
      "questions": [
        {
          "text": string,                // the question itself, WITHOUT any [Easy]/[2 Marks] prefix
          "difficulty": "easy" | "moderate" | "hard",
          "marks": number,               // integer
          "answer": string               // concise model answer for the answer key
        }
      ]
    }
  ]
}`;

export function buildSystemPrompt(): string {
  return [
    'You are an expert school examination paper setter.',
    'You design well-structured, curriculum-aligned question papers.',
    'You ALWAYS respond with a single valid JSON object and nothing else —',
    'no markdown, no code fences, no commentary before or after the JSON.',
  ].join(' ');
}

export function buildUserPrompt(input: AssignmentInput): string {
  const lines: string[] = [];

  lines.push(`Create an examination question paper with the following requirements.`);
  lines.push('');
  lines.push(`School: ${input.schoolName}`);
  lines.push(`Subject: ${input.subject}`);
  lines.push(`Class / Grade: ${input.className}`);
  lines.push(`Assignment title: ${input.title}`);
  lines.push('');
  lines.push('Question composition (group these into logical sections A, B, C ...):');
  for (const qt of input.questionTypes) {
    lines.push(`  - ${qt.count} x "${qt.type}", ${qt.marks} mark(s) each`);
  }

  const totalQ = input.questionTypes.reduce((s, q) => s + q.count, 0);
  const totalM = input.questionTypes.reduce((s, q) => s + q.count * q.marks, 0);
  lines.push('');
  lines.push(`Total questions: ${totalQ}. Total maximum marks: ${totalM}.`);

  if (input.additionalInfo?.trim()) {
    lines.push('');
    lines.push(`Additional instructions from the teacher: ${input.additionalInfo.trim()}`);
  }

  if (input.sourceText?.trim()) {
    lines.push('');
    lines.push('Base the questions on the following source material:');
    lines.push('"""');
    lines.push(input.sourceText.trim().slice(0, 6000));
    lines.push('"""');
  }

  lines.push('');
  lines.push('Rules:');
  lines.push('- Distribute questions across sections by question type.');
  lines.push('- Assign a difficulty of "easy", "moderate" or "hard" to every question.');
  lines.push('- Provide a concise correct answer for each question (used for an answer key).');
  lines.push('- Marks per question must match the composition above.');
  lines.push('- Do NOT put the difficulty or marks inside the question "text" field.');
  lines.push('');
  lines.push('Respond with ONLY a JSON object matching exactly this schema:');
  lines.push(RESPONSE_SCHEMA);

  return lines.join('\n');
}
