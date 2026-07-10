import type { ErrorRequestHandler } from 'express';

import { env } from '../config/env';
import { ApiError } from '../utils/api-error';

interface PostgreSqlError extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  if (error instanceof ApiError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.details === undefined ? {} : { details: error.details }),
    });
    return;
  }

  const databaseError = error as PostgreSqlError;

  if (databaseError.code === '23505') {
    response.status(409).json({
      success: false,
      message: 'The resource already exists',
      ...(env.NODE_ENV === 'development'
        ? { details: databaseError.detail ?? databaseError.constraint }
        : {}),
    });
    return;
  }

  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({
      success: false,
      message: 'Request body contains invalid JSON',
    });
    return;
  }

  console.error('Unhandled request error:', error);

  response.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(env.NODE_ENV === 'development' && error instanceof Error
      ? { details: error.message }
      : {}),
  });
};
