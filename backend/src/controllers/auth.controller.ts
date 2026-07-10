import type { RequestHandler } from 'express';

import { authService } from '../services/auth.service';
import { requireString } from '../utils/request-validation';

export class AuthController {
  login: RequestHandler = async (request, response) => {
    const identifier = requireString(request.body?.identifier, 'identifier');
    const password = requireString(request.body?.password, 'password');

    const result = await authService.login({
      identifier,
      password,
      ipAddress: request.ip ?? request.socket.remoteAddress ?? 'unknown',
      userAgent: request.get('user-agent') ?? 'unknown',
    });

    response.status(200).json({ success: true, data: result });
  };
}

export const authController = new AuthController();
