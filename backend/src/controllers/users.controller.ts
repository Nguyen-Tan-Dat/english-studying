import type { RequestHandler } from "express";

import { authService } from "../services/auth.service";
import { requireString } from "../utils/request-validation";

function getRequestIp(request: Parameters<RequestHandler>[0]): string {
  return request.ip ?? request.socket.remoteAddress ?? "unknown";
}

export class UsersController {
  register: RequestHandler = async (request, response) => {
    const email = requireString(request.body?.email, "email");
    const userName = requireString(request.body?.userName, "userName");
    const password = requireString(request.body?.password, "password");
    const pin = requireString(request.body?.pin, "pin");

    const result = await authService.register({
      email,
      userName,
      password,
      pin,
    });

    response.status(201).json({
      success: true,
      message: "Account registered successfully",
      data: result,
    });
  };

  login: RequestHandler = async (request, response) => {
    const identifier = requireString(request.body?.identifier, "identifier");
    const password = requireString(request.body?.password, "password");

    const result = await authService.login({
      identifier,
      password,
      ipAddress: getRequestIp(request),
      userAgent: request.get("user-agent") ?? "unknown",
    });

    response.status(200).json({ success: true, data: result });
  };

  forgotPassword: RequestHandler = async (request, response) => {
    const email = requireString(request.body?.email, "email");

    const result = await authService.forgotPassword({
      email,
      ipAddress: getRequestIp(request),
      userAgent: request.get("user-agent") ?? "unknown",
    });

    response.status(200).json({ success: true, data: result });
  };

  resetPassword: RequestHandler = async (request, response) => {
    const token = requireString(request.body?.token, "token");
    const newPassword = requireString(request.body?.newPassword, "newPassword");

    const result = await authService.resetPassword({ token, newPassword });

    response.status(200).json({ success: true, data: result });
  };
}

export const usersController = new UsersController();
