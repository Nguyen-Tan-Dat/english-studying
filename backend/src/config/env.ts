import 'dotenv/config';
import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4010),
  API_PREFIX: z.string().trim().startsWith('/').default('/api/v1'),

  DATA_MODE: z.enum(['memory', 'postgres']).default('memory'),
  DATABASE_URL: z
    .string()
    .url()
    .default('postgresql://lexigo:lexigo_dev_password@localhost:5432/lexigo'),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  JWT_SECRET: z.string().min(32).default('development-secret-change-me-123456789'),
  COOKIE_SECRET: z.string().min(32).default('development-cookie-change-me-123456789'),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),

  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:8080'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info')
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const details = parsedEnvironment.error.issues
    .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
    .join('\n');

  throw new Error(`Invalid backend environment configuration:\n${details}`);
}

if (
  parsedEnvironment.data.NODE_ENV === 'production' &&
  (parsedEnvironment.data.JWT_SECRET.startsWith('development-') ||
    parsedEnvironment.data.COOKIE_SECRET.startsWith('development-'))
) {
  throw new Error('Production requires secure JWT_SECRET and COOKIE_SECRET values.');
}

export const env = Object.freeze(parsedEnvironment.data);
export type Environment = typeof env;
