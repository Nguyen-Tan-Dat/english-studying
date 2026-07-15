import type { CorsOptions } from 'cors';
import { env } from './env.js';
const origins = new Set(env.CORS_ORIGINS.split(',').map((value) => value.trim()));
export const corsOptions: CorsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin || origins.has(origin)) return callback(null, true);
    callback(new Error('Origin is not allowed by CORS policy'));
  },
  allowedHeaders: ['Authorization', 'Content-Type', 'If-Match', 'Idempotency-Key', 'X-Request-ID'],
  exposedHeaders: ['ETag', 'X-Request-ID', 'Location', 'Retry-After'],
};
