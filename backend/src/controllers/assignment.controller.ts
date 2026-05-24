import { Request, Response } from 'express';
import { z } from 'zod';
import { Assignment } from '../models/Assignment';
import { GeneratedPaper } from '../models/GeneratedPaper';
import { enqueueGeneration } from '../queues/generation.queue';
import { cache } from '../services/cache.service';
import { HttpError } from '../middleware';
import { AssignmentInput } from '../types';

/* ------------------------------- Validation ------------------------------ */

const questionTypeSchema = z.object({
  type: z.string().min(1, 'Question type is required'),
  count: z.coerce.number().int().positive('No. of questions must be > 0'),
  marks: z.coerce.number().int().positive('Marks must be > 0'),
});

export const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  schoolName: z.string().min(1, 'School name is required'),
  className: z.string().min(1, 'Class is required'),
  subject: z.string().min(1, 'Subject is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  questionTypes: z.array(questionTypeSchema).min(1, 'Add at least one question type'),
  additionalInfo: z.string().optional().default(''),
  sourceText: z.string().optional().default(''),
});

type CreateAssignmentBody = z.infer<typeof createAssignmentSchema>;

/* -------------------------------- Handlers -------------------------------- */

export async function createAssignment(req: Request, res: Response): Promise<void> {
  const body = req.body as CreateAssignmentBody;

  const totalQuestions = body.questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = body.questionTypes.reduce((s, q) => s + q.count * q.marks, 0);

  const due = parseDate(body.dueDate);

  const assignment = await Assignment.create({
    ...body,
    dueDate: due,
    totalQuestions,
    totalMarks,
  });

  // Create the paper record up-front so the client can subscribe immediately.
  const paper = await GeneratedPaper.create({
    assignment: assignment._id,
    status: 'queued',
  });

  const input: AssignmentInput = {
    title: body.title,
    schoolName: body.schoolName,
    className: body.className,
    subject: body.subject,
    dueDate: body.dueDate,
    questionTypes: body.questionTypes,
    additionalInfo: body.additionalInfo,
    sourceText: body.sourceText,
  };

  const jobId = await enqueueGeneration({
    paperId: String(paper._id),
    assignmentId: String(assignment._id),
    input,
  });

  await GeneratedPaper.findByIdAndUpdate(paper._id, { jobId });
  await cache.setStatus(String(paper._id), {
    status: 'queued',
    progress: 5,
    message: 'Queued for generation',
  });

  res.status(201).json({
    assignmentId: String(assignment._id),
    paperId: String(paper._id),
    jobId,
  });
}

export async function listAssignments(_req: Request, res: Response): Promise<void> {
  const assignments = await Assignment.find()
    .sort({ createdAt: -1 })
    .select('title subject className dueDate totalQuestions totalMarks createdAt latestPaper')
    .lean();
  res.json({ assignments });
}

export async function getAssignment(req: Request, res: Response): Promise<void> {
  const assignment = await Assignment.findById(req.params.id).lean();
  if (!assignment) throw new HttpError(404, 'Assignment not found');
  res.json({ assignment });
}

export async function deleteAssignment(req: Request, res: Response): Promise<void> {
  const assignment = await Assignment.findByIdAndDelete(req.params.id);
  if (!assignment) throw new HttpError(404, 'Assignment not found');
  await GeneratedPaper.deleteMany({ assignment: assignment._id });
  res.json({ ok: true });
}

/* -------------------------------- Helpers --------------------------------- */

function parseDate(value: string): Date {
  // Accept DD-MM-YYYY or ISO.
  const ddmmyyyy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (ddmmyyyy) {
    const [, dd, mm, yyyy] = ddmmyyyy;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new HttpError(400, 'Invalid due date');
  return d;
}
