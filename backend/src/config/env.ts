import dotenv from "dotenv";

dotenv.config({ quiet: true });

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

function readIntegerInRange(
  name: string,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const value = readNumber(name, fallback);

  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(
      `${name} must be an integer between ${minimum} and ${maximum}`,
    );
  }

  return value;
}

function readBoolean(name: string, fallback = false): boolean {
  const rawValue = process.env[name]?.trim().toLowerCase();

  if (!rawValue) {
    return fallback;
  }

  if (rawValue === "true") {
    return true;
  }

  if (rawValue === "false") {
    return false;
  }

  throw new Error(`${name} must be either true or false`);
}

function readUrl(name: string, fallback: string): string {
  const value = process.env[name]?.trim() || fallback;

  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`${name} must be a valid absolute URL`);
  }
}

const databaseUrl = process.env.DATABASE_URL?.trim();
const nodeEnv = process.env.NODE_ENV?.trim() || "development";

export const env = {
  PORT: readIntegerInRange("PORT", 3000, 1, 65_535),
  NODE_ENV: nodeEnv,

  JWT_SECRET: readRequired("JWT_SECRET"),
  JWT_ISSUER: process.env.JWT_ISSUER?.trim() || "english-learning-api",
  JWT_AUDIENCE: process.env.JWT_AUDIENCE?.trim() || "english-learning-client",
  JWT_EXPIRES_IN_SECONDS: readIntegerInRange(
    "JWT_EXPIRES_IN_SECONDS",
    604_800,
    60,
    31_536_000,
  ),

  BCRYPT_SALT_ROUNDS: readIntegerInRange("BCRYPT_SALT_ROUNDS", 12, 4, 15),
  PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES: readIntegerInRange(
    "PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES",
    15,
    5,
    1_440,
  ),
  PASSWORD_RESET_URL: readUrl(
    "PASSWORD_RESET_URL",
    "http://localhost:5173/reset-password",
  ),
  RETURN_PASSWORD_RESET_TOKEN: readBoolean(
    "RETURN_PASSWORD_RESET_TOKEN",
    nodeEnv !== "production",
  ),

  DATABASE_URL: databaseUrl,
  DB_HOST: databaseUrl ? undefined : readRequired("DB_HOST"),
  DB_PORT: databaseUrl
    ? undefined
    : readIntegerInRange("DB_PORT", 5432, 1, 65_535),
  DB_NAME: databaseUrl ? undefined : readRequired("DB_NAME"),
  DB_USER: databaseUrl ? undefined : readRequired("DB_USER"),
  DB_PASSWORD: databaseUrl ? undefined : readRequired("DB_PASSWORD"),
  DB_SSL: readBoolean("DB_SSL", false),
  DB_POOL_MAX: readIntegerInRange("DB_POOL_MAX", 10, 1, 100),
  DB_IDLE_TIMEOUT_MS: readIntegerInRange(
    "DB_IDLE_TIMEOUT_MS",
    30_000,
    1_000,
    600_000,
  ),
  DB_CONNECTION_TIMEOUT_MS: readIntegerInRange(
    "DB_CONNECTION_TIMEOUT_MS",
    5_000,
    1_000,
    120_000,
  ),
} as const;
