import type { RequestHandler } from 'express';
import { createHash } from 'node:crypto';
import { ConflictError, ValidationError } from '../errors/app-error.js';

type Entry = { hash: string; status: number; body: unknown; headers: Record<string, string> };
const records = new Map<string, Entry>();

export const idempotency = (required = true): RequestHandler => (req, res, next) => {
  const key = req.header('Idempotency-Key');
  if (!key) {
    if (required) return next(new ValidationError('Idempotency-Key header is required'));
    return next();
  }
  const principal = req.user?.id ?? req.ip ?? 'anonymous';
  const cacheKey = `${principal}:${req.method}:${req.path}:${key}`;
  const hash = createHash('sha256').update(JSON.stringify(req.body ?? {})).digest('hex');
  const existing = records.get(cacheKey);
  if (existing) {
    if (existing.hash !== hash) return next(new ConflictError('IDEMPOTENCY_KEY_REUSED', 'Idempotency key was reused with a different payload'));
    for (const [name, value] of Object.entries(existing.headers)) res.setHeader(name, value);
    return res.status(existing.status).json(existing.body);
  }
  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    if (res.statusCode < 500) records.set(cacheKey, { hash, status: res.statusCode, body, headers: {} });
    return originalJson(body);
  }) as typeof res.json;
  next();
};
