import type { RequestHandler } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error.js';
export const requireRole = (...roles: Array<'ADMIN' | 'LEARNER'>): RequestHandler => (req, _res, next) => {
  if (!req.user) return next(new UnauthorizedError());
  if (!roles.some((role) => req.user?.roles.includes(role))) return next(new ForbiddenError());
  next();
};
