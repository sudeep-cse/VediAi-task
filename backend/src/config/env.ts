import dotenv from 'dotenv';

dotenv.config();

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: num(process.env.PORT, 4000),

  mongoUri: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/ai_assessment',

  redis: {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: num(process.env.REDIS_PORT, 6379),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  // AI provider: "anthropic" | "openai" | "mock"
  aiProvider: (process.env.AI_PROVIDER ?? 'mock').toLowerCase(),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  anthropicModel: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',

  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',

  // How long (seconds) a generated paper is cached in Redis.
  cacheTtlSeconds: num(process.env.CACHE_TTL_SECONDS, 60 * 60 * 24),
} as const;

export type Env = typeof env;
