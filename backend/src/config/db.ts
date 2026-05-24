import mongoose from 'mongoose';
import { env } from './env';
import { createLogger } from '../utils/logger';

const log = createLogger('mongo');

export async function connectMongo(): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => log.info('MongoDB connected'));
  mongoose.connection.on('error', (err) => log.error('MongoDB error', err?.message));
  mongoose.connection.on('disconnected', () => log.warn('MongoDB disconnected'));

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10_000,
  });

  return mongoose;
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}
