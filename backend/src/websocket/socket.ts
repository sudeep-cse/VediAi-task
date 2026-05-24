import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import { env } from '../config/env';
import { createLogger } from '../utils/logger';
import { PaperStatusPayload } from '../services/cache.service';
import { StructuredPaper } from '../types';

const log = createLogger('ws');

let io: IOServer | null = null;

/** Clients join a room named after the paperId to receive its updates. */
const room = (paperId: string) => `paper:${paperId}`;

export function initSocket(server: HttpServer): IOServer {
  io = new IOServer(server, {
    cors: { origin: env.corsOrigin, methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket: Socket) => {
    log.info(`Socket connected ${socket.id}`);

    socket.on('subscribe', (paperId: string) => {
      if (typeof paperId === 'string' && paperId) {
        socket.join(room(paperId));
        log.debug(`socket ${socket.id} subscribed to ${paperId}`);
      }
    });

    socket.on('unsubscribe', (paperId: string) => {
      socket.leave(room(paperId));
    });

    socket.on('disconnect', () => log.debug(`Socket disconnected ${socket.id}`));
  });

  return io;
}

export function getIO(): IOServer {
  if (!io) throw new Error('Socket.io not initialised');
  return io;
}

/* ----------------------- Emit helpers (used by worker) -------------------- */

export function emitProgress(paperId: string, payload: PaperStatusPayload): void {
  io?.to(room(paperId)).emit('paper:progress', { paperId, ...payload });
}

export function emitCompleted(paperId: string, paper: StructuredPaper): void {
  io?.to(room(paperId)).emit('paper:completed', { paperId, paper });
}

export function emitFailed(paperId: string, error: string): void {
  io?.to(room(paperId)).emit('paper:failed', { paperId, error });
}
