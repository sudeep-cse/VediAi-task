import { createServer } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { connectMongo } from './config/db';
import { initSocket } from './websocket/socket';
import { bridgeEventsToSocket } from './services/events.service';
import { createLogger } from './utils/logger';

const log = createLogger('server');

async function main() {
  await connectMongo();

  const app = createApp();
  const server = createServer(app);

  // WebSocket + the Redis→Socket bridge so worker events reach clients.
  initSocket(server);
  bridgeEventsToSocket();

  server.listen(env.port, () => {
    log.info(`API listening on http://localhost:${env.port}`);
    log.info(`AI provider: ${env.aiProvider}`);
  });

  const shutdown = () => {
    log.info('Shutting down…');
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  log.error('Fatal startup error', err?.message);
  process.exit(1);
});
