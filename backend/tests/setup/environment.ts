import path from "node:path";

import dotenv from "dotenv";

const envPath = path.resolve(process.cwd(), ".env.test");

dotenv.config({ path: envPath, override: true, quiet: true });

process.env.NODE_ENV = "test";

const testDatabaseUrl =
  process.env.TEST_DATABASE_URL?.trim() ??
  "postgresql://postgres:postgres@127.0.0.1:5432/english_learning_test";

process.env.DATABASE_URL = testDatabaseUrl;
process.env.DB_SSL ??= "false";
process.env.DB_POOL_MAX ??= "5";
process.env.DB_IDLE_TIMEOUT_MS ??= "1000";
process.env.DB_CONNECTION_TIMEOUT_MS ??= "5000";
process.env.JWT_SECRET ??= "automatic-test-secret-at-least-32-characters";
process.env.JWT_ISSUER ??= "english-learning-api-test";
process.env.JWT_AUDIENCE ??= "english-learning-client-test";
process.env.JWT_EXPIRES_IN_SECONDS ??= "3600";
process.env.BCRYPT_SALT_ROUNDS ??= "4";
process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES ??= "15";
process.env.PASSWORD_RESET_URL ??= "http://localhost:5173/reset-password";
process.env.RETURN_PASSWORD_RESET_TOKEN = "true";
