import type { RequestHandler } from "express";

import type { PermissionName } from "../config/rbac";
import { authorizationService } from "../services/authorization.service";
import { ApiError } from "../utils/api-error";

export function requirePermissions(
  ...permissionNames: PermissionName[]
): RequestHandler {
  return async (request, _response, next) => {
    const userId = request.authUser?.id;

    if (!userId) {
      throw ApiError.unauthorized();
    }

    const isAllowed = await authorizationService.hasAllPermissions(
      userId,
      permissionNames,
    );

    if (!isAllowed) {
      throw ApiError.forbidden(
        `Missing required permission: ${permissionNames.join(", ")}`,
      );
    }

    next();
  };
}
