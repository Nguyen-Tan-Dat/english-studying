import type { RequestHandler } from 'express';

import { authService } from '../services/auth.service';
import { ApiError } from '../utils/api-error';

export const authenticate: RequestHandler = async (request, _response, next) => {
  const authorizationHeader = request.get('authorization');

  if (!authorizationHeader?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Bearer access token is required');
  }

  const accessToken = authorizationHeader.slice('Bearer '.length).trim();

  if (!accessToken) {
    throw ApiError.unauthorized('Bearer access token is required');
  }

  request.authUser = await authService.verifyAccessToken(accessToken);
  next();
};
