import type { RequestHandler } from 'express';
import { UnauthorizedError } from '../errors/app-error.js';
import { verifyAccessToken } from '../utils/jwt.js';
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.header('Authorization');
  if (!header?.startsWith('Bearer ')) return next(new UnauthorizedError());
  try { const claims = verifyAccessToken(header.slice(7)); req.user = { id: claims.sub, roles: claims.roles }; next(); }
  catch { next(new UnauthorizedError('Access token is invalid or expired')); }
};
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const header = req.header('Authorization'); if (!header?.startsWith('Bearer ')) return next();
  try { const claims = verifyAccessToken(header.slice(7)); req.user = { id: claims.sub, roles: claims.roles }; } catch { /* public request */ }
  next();
};
