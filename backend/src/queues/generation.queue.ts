import { Queue, QueueEvents } from 'bullmq';
import { createRedis } from '../config/redis';
import { GenerationJobData } from '../types';

export const GENERATION_QUEUE = 'paper-generation';

// BullMQ needs its own ioredis connection (maxRetriesPerRequest: null is set in factory).
const connection = createRedis();

export const generationQueue = new Queue<GenerationJobData>(GENERATION_QUEUE, {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 60 * 60, count: 1000 },
    removeOnFail: { age: 24 * 60 * 60 },
  },
});

// Optional: surface queue-level events (useful for logging/metrics).
export const generationQueueEvents = new QueueEvents(GENERATION_QUEUE, {
  connection: createRedis(),
});

export async function enqueueGeneration(data: GenerationJobData): Promise<string> {
  const job = await generationQueue.add('generate', data, { jobId: data.paperId });
  return job.id as string;
}
