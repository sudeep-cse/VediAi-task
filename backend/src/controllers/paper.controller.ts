import { Request, Response } from 'express';
import { GeneratedPaper } from '../models/GeneratedPaper';
import { Assignment } from '../models/Assignment';
import { cache } from '../services/cache.service';
import { enqueueGeneration } from '../queues/generation.queue';
import { renderPaperPdf } from '../services/pdf.service';
import { HttpError } from '../middleware';
import { AssignmentInput, StructuredPaper } from '../types';

/** Live job status — reads Redis first, falls back to Mongo. */
export async function getPaperStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const cached = await cache.getStatus(id);
  if (cached) {
    res.json(cached);
    return;
  }
  const paper = await GeneratedPaper.findById(id).select('status error').lean();
  if (!paper) throw new HttpError(404, 'Paper not found');
  res.json({
    status: paper.status,
    progress: paper.status === 'completed' ? 100 : 0,
    error: paper.error,
  });
}

/** Full structured paper — cache-first (Redis), then Mongo. */
export async function getPaper(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const cached = await cache.getPaper(id);
  if (cached) {
    res.json({ status: 'completed', paper: cached, cached: true });
    return;
  }

  const doc = await GeneratedPaper.findById(id).lean();
  if (!doc) throw new HttpError(404, 'Paper not found');

  if (doc.status !== 'completed') {
    res.json({ status: doc.status, paper: null, error: doc.error });
    return;
  }

  const paper = toStructured(doc);
  await cache.setPaper(id, paper); // warm the cache
  res.json({ status: 'completed', paper, cached: false });
}

/** Regenerate — re-enqueues the same assignment, clears cache. */
export async function regeneratePaper(req: Request, res: Response): Promise<void> {
  const { id } = req.params; // paperId
  const paper = await GeneratedPaper.findById(id);
  if (!paper) throw new HttpError(404, 'Paper not found');

  const assignment = await Assignment.findById(paper.assignment).lean();
  if (!assignment) throw new HttpError(404, 'Assignment not found');

  await GeneratedPaper.findByIdAndUpdate(id, { status: 'queued', error: undefined, sections: [] });

  const input: AssignmentInput = {
    title: assignment.title,
    schoolName: assignment.schoolName,
    className: assignment.className,
    subject: assignment.subject,
    dueDate: new Date(assignment.dueDate).toISOString(),
    questionTypes: assignment.questionTypes,
    additionalInfo: assignment.additionalInfo,
    sourceText: assignment.sourceText,
  };

  const jobId = await enqueueGeneration({
    paperId: id,
    assignmentId: String(assignment._id),
    input,
  });

  await cache.setStatus(id, { status: 'queued', progress: 5, message: 'Re-queued' });
  res.json({ paperId: id, jobId });
}

/** Streams a formatted PDF (not raw HTML print). */
export async function downloadPaperPdf(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  let paper = await cache.getPaper(id);
  if (!paper) {
    const doc = await GeneratedPaper.findById(id).lean();
    if (!doc || doc.status !== 'completed') throw new HttpError(404, 'Paper not ready');
    paper = toStructured(doc);
  }

  const buffer = await renderPaperPdf(paper);
  const fileName = `${paper.subject}-${paper.className}-question-paper.pdf`.replace(/\s+/g, '_');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(buffer);
}

/* -------------------------------- Helpers --------------------------------- */

function toStructured(doc: any): StructuredPaper {
  return {
    schoolName: doc.schoolName,
    subject: doc.subject,
    className: doc.className,
    timeAllowed: doc.timeAllowed,
    maximumMarks: doc.maximumMarks,
    generalInstructions: doc.generalInstructions,
    intro: doc.intro,
    sections: doc.sections,
    totalQuestions: doc.totalQuestions,
    totalMarks: doc.totalMarks,
  };
}
