import type { RequestHandler } from 'express';

import { ApiError } from '../utils/api-error';

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(ApiError.notFound(`Route not found: ${request.method} ${request.originalUrl}`));
};
