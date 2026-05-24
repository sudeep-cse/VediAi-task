import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { env } from '../config/env';
import { createLogger } from '../utils/logger';
import { AssignmentInput, StructuredPaper, Difficulty } from '../types';
import { buildSystemPrompt, buildUserPrompt } from './prompt.builder';
import { parsePaper } from './parser';

const log = createLogger('ai');

/** Calls the configured provider and returns RAW text (parsed later). */
async function callModel(input: AssignmentInput): Promise<string> {
  const system = buildSystemPrompt();
  const user = buildUserPrompt(input);

  if (env.aiProvider === 'anthropic') {
    if (!env.anthropicApiKey) throw new Error('ANTHROPIC_API_KEY is not set');
    const client = new Anthropic({ apiKey: env.anthropicApiKey });
    const res = await client.messages.create({
      model: env.anthropicModel,
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: user }],
    });
    return res.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('\n')
      .trim();
  }

  if (env.aiProvider === 'openai') {
    if (!env.openaiApiKey) throw new Error('OPENAI_API_KEY is not set');
    const client = new OpenAI({ apiKey: env.openaiApiKey });
    const res = await client.chat.completions.create({
      model: env.openaiModel,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });
    return res.choices[0]?.message?.content?.trim() ?? '';
  }

  // mock provider — deterministic, lets the whole pipeline run with no keys.
  return mockModelJson(input);
}

/**
 * Public entry point used by the worker.
 * Returns a validated, structured paper — never raw text.
 */
export async function generatePaper(input: AssignmentInput): Promise<StructuredPaper> {
  log.info(`Generating paper via "${env.aiProvider}"`, {
    subject: input.subject,
    className: input.className,
  });
  const raw = await callModel(input);
  const paper = parsePaper(raw, input);
  log.info('Paper parsed', {
    sections: paper.sections.length,
    totalQuestions: paper.totalQuestions,
    totalMarks: paper.totalMarks,
  });
  return paper;
}

/* ----------------------------- Mock generator ----------------------------- */

const SAMPLE_QUESTIONS: Record<string, string[]> = {
  default: [
    'Define the key concept and explain its purpose.',
    'Describe one real-world example where this concept applies.',
    'Explain the difference between the two related ideas with an example.',
    'State the main advantages and limitations.',
    'Justify why this method is preferred in the given scenario.',
    'Outline the step-by-step process involved.',
    'Compare and contrast the two approaches discussed in class.',
    'Explain the importance of this topic in everyday life.',
    'Write the relevant relationship/equation and explain each term.',
    'Analyse the result and draw an appropriate conclusion.',
  ],
};

function rotate<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function mockModelJson(input: AssignmentInput): string {
  const difficulties: Difficulty[] = ['easy', 'moderate', 'hard'];
  const sections = input.questionTypes.map((qt, sIdx) => {
    const questions = Array.from({ length: qt.count }).map((_, qIdx) => ({
      text: `${rotate(SAMPLE_QUESTIONS.default, sIdx * 3 + qIdx)} (${qt.type}, on ${input.subject})`,
      difficulty: rotate(difficulties, qIdx),
      marks: qt.marks,
      answer: `Model answer ${qIdx + 1}: a concise, correct explanation aligned to the ${input.className} ${input.subject} curriculum.`,
    }));
    return {
      id: String.fromCharCode(65 + sIdx),
      title: qt.type,
      instruction: `Attempt all questions. Each question carries ${qt.marks} mark(s).`,
      questions,
    };
  });

  return JSON.stringify({
    intro: `Certainly! Here is a customized question paper for your ${input.subject} class (${input.className}).`,
    timeAllowed: '45 minutes',
    generalInstructions: 'All questions are compulsory unless stated otherwise.',
    sections,
  });
}
