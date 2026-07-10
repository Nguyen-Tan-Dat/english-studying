import dotenv from 'dotenv';

dotenv.config();

function readRequired(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readNumber(name: string, fallback: number): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const value = Number(rawValue);

  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a valid number`);
  }

  return value;
}

function readBoolean(name: string, fallback = false): boolean {
  const rawValue = process.env[name]?.trim().toLowerCase();

  if (!rawValue) {
    return fallback;
  }

  if (rawValue === 'true') {
    return true;
  }

  if (rawValue === 'false') {
    return false;
  }

  throw new Error(`${name} must be either true or false`);
}

const databaseUrl = process.env.DATABASE_URL?.trim();

export const env = {
  PORT: readNumber('PORT', 3000),
  NODE_ENV: process.env.NODE_ENV?.trim() || 'development',

  JWT_SECRET: readRequired('JWT_SECRET'),
  JWT_ISSUER: process.env.JWT_ISSUER?.trim() || 'english-learning-api',
  JWT_AUDIENCE: process.env.JWT_AUDIENCE?.trim() || 'english-learning-client',
  JWT_EXPIRES_IN_SECONDS: readNumber('JWT_EXPIRES_IN_SECONDS', 604_800),

  DATABASE_URL: databaseUrl,
  DB_HOST: databaseUrl ? undefined : readRequired('DB_HOST'),
  DB_PORT: databaseUrl ? undefined : readNumber('DB_PORT', 5432),
  DB_NAME: databaseUrl ? undefined : readRequired('DB_NAME'),
  DB_USER: databaseUrl ? undefined : readRequired('DB_USER'),
  DB_PASSWORD: databaseUrl ? undefined : readRequired('DB_PASSWORD'),
  DB_SSL: readBoolean('DB_SSL', false),
  DB_POOL_MAX: readNumber('DB_POOL_MAX', 10),
  DB_IDLE_TIMEOUT_MS: readNumber('DB_IDLE_TIMEOUT_MS', 30_000),
  DB_CONNECTION_TIMEOUT_MS: readNumber('DB_CONNECTION_TIMEOUT_MS', 5_000),
} as const;
