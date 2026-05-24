import { Redis, RedisOptions } from 'ioredis';
import { env } from './env';
import { createLogger } from '../utils/logger';

const log = createLogger('redis');

/**
 * BullMQ requires `maxRetriesPerRequest: null` on its connection.
 * We expose a factory so the API, cache and the worker each get their own
 * client (sharing a single ioredis instance across blocking consumers is
 * discouraged by BullMQ).
 */
export function createRedis(opts: Partial<RedisOptions> = {}): Redis {
  const client = new Redis({
    host: env.redis.host,
    port: env.redis.port,
    password: env.redis.password,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    ...opts,
  });

  client.on('connect', () => log.info('Redis connected'));
  client.on('error', (err) => log.error('Redis error', err?.message));
  return client;
}

// General-purpose client for caching / job-status reads.
export const redis = createRedis();
