import dotenv from 'dotenv';

dotenv.config();

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: num(process.env.PORT, 4000),

  // MongoDB
  mongoUri:
    process.env.MONGO_URI ??
    'mongodb://127.0.0.1:27017/ai_assessment',

  // Redis
  redis: {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: num(process.env.REDIS_PORT, 6379),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  // AI Provider: "anthropic" | "openai" | "gemini" | "mock"
  aiProvider: (process.env.AI_PROVIDER ?? 'mock').toLowerCase(),

  // Anthropic
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  anthropicModel:
    process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514',

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',

  // Google Gemini
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',

  // CORS
  corsOrigin:
    process.env.CORS_ORIGIN ?? 'http://localhost:3000',

  // Cache TTL (seconds)
  cacheTtlSeconds: num(
    process.env.CACHE_TTL_SECONDS,
    60 * 60 * 24
  ),

  // Worker
  workerConcurrency: num(
    process.env.WORKER_CONCURRENCY,
    3
  ),
} as const;

export type Env = typeof env;