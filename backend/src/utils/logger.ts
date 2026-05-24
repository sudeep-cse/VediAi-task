/* Tiny structured logger — no extra deps. Replace with pino/winston in prod. */

type Level = 'info' | 'warn' | 'error' | 'debug';

function emit(level: Level, scope: string, msg: string, meta?: unknown) {
  const time = new Date().toISOString();
  const base = `[${time}] [${level.toUpperCase()}] [${scope}] ${msg}`;
  const line = meta !== undefined ? `${base} ${safe(meta)}` : base;
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

function safe(meta: unknown): string {
  try {
    return typeof meta === 'string' ? meta : JSON.stringify(meta);
  } catch {
    return String(meta);
  }
}

export function createLogger(scope: string) {
  return {
    info: (msg: string, meta?: unknown) => emit('info', scope, msg, meta),
    warn: (msg: string, meta?: unknown) => emit('warn', scope, msg, meta),
    error: (msg: string, meta?: unknown) => emit('error', scope, msg, meta),
    debug: (msg: string, meta?: unknown) => emit('debug', scope, msg, meta),
  };
}

export const logger = createLogger('app');
