import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool, type PoolConfig } from 'pg';

import { env } from '../config/env';
import type { Database } from './types';

const poolConfig: PoolConfig = {
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: env.DB_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT_MS,
};

if (env.DATABASE_URL) {
  poolConfig.connectionString = env.DATABASE_URL;
} else {
  poolConfig.host = env.DB_HOST;
  poolConfig.port = env.DB_PORT;
  poolConfig.database = env.DB_NAME;
  poolConfig.user = env.DB_USER;
  poolConfig.password = env.DB_PASSWORD;
}

if (env.DB_SSL) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

export const pool = new Pool(poolConfig);

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
});

export async function checkDatabaseConnection(): Promise<void> {
  await sql`select 1`.execute(db);
}

export async function closeDatabaseConnection(): Promise<void> {
  await db.destroy();
}
