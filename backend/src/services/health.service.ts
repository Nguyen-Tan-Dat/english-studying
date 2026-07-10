import { sql } from 'kysely';

import { db } from '../database/db';

export class HealthService {
  async getStatus(): Promise<{
    status: 'OK';
    database: 'connected';
    timestamp: string;
  }> {
    await sql`select 1`.execute(db);

    return {
      status: 'OK',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  }
}

export const healthService = new HealthService();
