import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import { env } from '../../config/env.js';
import { databaseConfig } from '../../config/database.js';
import type { Database } from './types.js';
const pool = new pg.Pool({ connectionString: env.DATABASE_URL, max: databaseConfig.poolMax, idleTimeoutMillis: databaseConfig.idleTimeoutMs, connectionTimeoutMillis: databaseConfig.connectionTimeoutMs });
export const db = new Kysely<Database>({ dialect: new PostgresDialect({ pool }) });
export const closeDatabase = () => db.destroy();
