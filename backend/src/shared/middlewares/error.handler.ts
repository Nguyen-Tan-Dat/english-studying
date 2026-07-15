import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';
import { logger } from '../../config/logger.js';

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  void next;
  const requestId = req.requestId;
  if (error instanceof ZodError) {
    return res.status(422).type('application/problem+json').json({
      type: 'https://lexigo.local/problems/validation', title: 'Validation failed', status: 422,
      code: 'VALIDATION_ERROR', trace_id: requestId,
      errors: error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
    });
  }
  if (error instanceof AppError) {
    return res.status(error.status).type('application/problem+json').json({
      type: `https://lexigo.local/problems/${error.code.toLowerCase().replaceAll('_', '-')}`,
      title: error.message, status: error.status, code: error.code, trace_id: requestId, ...error.details,
    });
  }
  logger.error({ err: error, requestId }, 'Unhandled request error');
  return res.status(500).type('application/problem+json').json({
    type: 'https://lexigo.local/problems/internal', title: 'Internal server error', status: 500,
    code: 'INTERNAL_ERROR', trace_id: requestId,
  });
};
