import express, { Application } from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware';

export function createApp(): Application {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', routes);

  // 404
  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

  app.use(errorHandler);
  return app;
}
