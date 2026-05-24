import { createRedis } from '../config/redis';
import { createLogger } from '../utils/logger';
import { PaperStatusPayload } from './cache.service';
import { StructuredPaper } from '../types';
import { emitProgress, emitCompleted, emitFailed } from '../websocket/socket';

const log = createLogger('events');
const CHANNEL = 'paper-events';

// Dedicated publisher (worker process uses this).
const publisher = createRedis();

type Event =
  | { type: 'progress'; paperId: string; payload: PaperStatusPayload }
  | { type: 'completed'; paperId: string; paper: StructuredPaper }
  | { type: 'failed'; paperId: string; error: string };

function publish(event: Event): void {
  publisher.publish(CHANNEL, JSON.stringify(event)).catch((e) => log.error('publish failed', e?.message));
}

export const events = {
  progress(paperId: string, payload: PaperStatusPayload) {
    publish({ type: 'progress', paperId, payload });
  },
  completed(paperId: string, paper: StructuredPaper) {
    publish({ type: 'completed', paperId, paper });
  },
  failed(paperId: string, error: string) {
    publish({ type: 'failed', paperId, error });
  },
};

/**
 * Called once by the API process. Subscribes to the Redis channel and forwards
 * every event to the correct Socket.io room. This is what makes real-time
 * updates work even though the worker is a separate process.
 */
export function bridgeEventsToSocket(): void {
  const subscriber = createRedis();
  subscriber.subscribe(CHANNEL, (err) => {
    if (err) log.error('subscribe failed', err.message);
    else log.info(`Subscribed to "${CHANNEL}" — bridging to Socket.io`);
  });

  subscriber.on('message', (_channel, message) => {
    try {
      const event = JSON.parse(message) as Event;
      if (event.type === 'progress') emitProgress(event.paperId, event.payload);
      else if (event.type === 'completed') emitCompleted(event.paperId, event.paper);
      else if (event.type === 'failed') emitFailed(event.paperId, event.error);
    } catch (e) {
      log.error('bad event message', (e as Error).message);
    }
  });
}
