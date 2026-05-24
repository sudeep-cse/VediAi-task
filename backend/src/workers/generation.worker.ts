import { Worker, Job } from 'bullmq';
import { createRedis } from '../config/redis';
import { connectMongo } from '../config/db';
import { env } from '../config/env';
import { createLogger } from '../utils/logger';
import { GENERATION_QUEUE } from '../queues/generation.queue';
import { GenerationJobData } from '../types';
import { generatePaper } from '../services/ai.service';
import { cache } from '../services/cache.service';
import { events } from '../services/events.service';
import { GeneratedPaper } from '../models/GeneratedPaper';
import { Assignment } from '../models/Assignment';

const log = createLogger('worker');

async function processJob(job: Job<GenerationJobData>): Promise<void> {
  const { paperId, input } = job.data;
  log.info(`Processing job ${job.id} for paper ${paperId}`);

  const report = async (progress: number, message: string) => {
    await job.updateProgress(progress);
    const payload = { status: 'processing' as const, progress, message };
    await cache.setStatus(paperId, payload);
    events.progress(paperId, payload);
  };

  await GeneratedPaper.findByIdAndUpdate(paperId, { status: 'processing' });
  await report(15, 'Building structured prompt…');
  await report(40, 'Generating questions with AI…');

  const paper = await generatePaper(input);

  await report(80, 'Parsing and structuring the paper…');

  // Persist structured result (never raw text).
  await GeneratedPaper.findByIdAndUpdate(paperId, {
    status: 'completed',
    error: undefined,
    schoolName: paper.schoolName,
    subject: paper.subject,
    className: paper.className,
    timeAllowed: paper.timeAllowed,
    maximumMarks: paper.maximumMarks,
    generalInstructions: paper.generalInstructions,
    intro: paper.intro,
    sections: paper.sections,
    totalQuestions: paper.totalQuestions,
    totalMarks: paper.totalMarks,
  });

  await Assignment.findByIdAndUpdate(job.data.assignmentId, { latestPaper: paperId });

  // Cache + final status + notify.
  await cache.setPaper(paperId, paper);
  await cache.setStatus(paperId, { status: 'completed', progress: 100, message: 'Done' });
  events.completed(paperId, paper);

  log.info(`Job ${job.id} completed`);
}

async function start() {
  await connectMongo();

  const worker = new Worker<GenerationJobData>(GENERATION_QUEUE, processJob, {
    connection: createRedis(),
    concurrency: Number(process.env.WORKER_CONCURRENCY ?? 3),
  });

  worker.on('failed', async (job, err) => {
    log.error(`Job ${job?.id} failed`, err?.message);
    if (job?.data?.paperId) {
      const paperId = job.data.paperId;
      await GeneratedPaper.findByIdAndUpdate(paperId, {
        status: 'failed',
        error: err?.message ?? 'Generation failed',
      }).catch(() => undefined);
      await cache.setStatus(paperId, {
        status: 'failed',
        progress: 100,
        error: err?.message ?? 'Generation failed',
      });
      events.failed(paperId, err?.message ?? 'Generation failed');
    }
  });

  worker.on('ready', () =>
    log.info(`Worker ready (provider="${env.aiProvider}", concurrency set)`),
  );

  process.on('SIGTERM', async () => {
    await worker.close();
    process.exit(0);
  });
}

start().catch((err) => {
  log.error('Worker failed to start', err?.message);
  process.exit(1);
});
