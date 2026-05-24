import { redis } from '../config/redis';
import { env } from '../config/env';
import { JobStatus, StructuredPaper } from '../types';

const paperKey = (paperId: string) => `paper:${paperId}`;
const statusKey = (paperId: string) => `paper:status:${paperId}`;

export interface PaperStatusPayload {
  status: JobStatus;
  progress: number; // 0..100
  message?: string;
  error?: string;
}

export const cache = {
  /** Cache the final structured paper. */
  async setPaper(paperId: string, paper: StructuredPaper): Promise<void> {
    await redis.set(paperKey(paperId), JSON.stringify(paper), 'EX', env.cacheTtlSeconds);
  },

  async getPaper(paperId: string): Promise<StructuredPaper | null> {
    const raw = await redis.get(paperKey(paperId));
    return raw ? (JSON.parse(raw) as StructuredPaper) : null;
  },

  /** Track live job status (read by the status endpoint and emitted via WS). */
  async setStatus(paperId: string, payload: PaperStatusPayload): Promise<void> {
    await redis.set(statusKey(paperId), JSON.stringify(payload), 'EX', 60 * 60);
  },

  async getStatus(paperId: string): Promise<PaperStatusPayload | null> {
    const raw = await redis.get(statusKey(paperId));
    return raw ? (JSON.parse(raw) as PaperStatusPayload) : null;
  },
};
