import type { RequestHandler } from "express";

import { adminRoleService } from "../services/admin-role.service";
import { ApiError } from "../utils/api-error";
import {
  optionalNullableString,
  requireString,
  requireStringArray,
} from "../utils/request-validation";

function normalizeRoleName(value: unknown): string {
  const roleName = requireString(value, "name").toLowerCase();

  if (!/^[a-z][a-z0-9_]{1,49}$/.test(roleName)) {
    throw ApiError.badRequest(
      "name must contain 2-50 lowercase letters, numbers, or underscores",
    );
  }

  return roleName;
}

export class AdminRoleController {
  list: RequestHandler = async (_request, response) => {
    const roles = await adminRoleService.listRoles();
    response.status(200).json({ success: true, data: roles });
  };

  getById: RequestHandler = async (request, response) => {
    const roleId = requireString(request.params.id, "role id");
    const role = await adminRoleService.getRoleById(roleId);
    response.status(200).json({ success: true, data: role });
  };

  listPermissions: RequestHandler = async (_request, response) => {
    const permissions = await adminRoleService.listPermissions();
    response.status(200).json({ success: true, data: permissions });
  };

  create: RequestHandler = async (request, response) => {
    const role = await adminRoleService.createRole({
      name: normalizeRoleName(request.body?.name),
      description:
        optionalNullableString(request.body?.description, "description") ??
        null,
      permissionNames: requireStringArray(
        request.body?.permissionNames ?? [],
        "permissionNames",
      ),
    });

    response.status(201).json({ success: true, data: role });
  };

  update: RequestHandler = async (request, response) => {
    const roleId = requireString(request.params.id, "role id");
    const hasName = request.body?.name !== undefined;
    const hasDescription = request.body?.description !== undefined;

    if (!hasName && !hasDescription) {
      throw ApiError.badRequest("At least name or description is required");
    }

    const role = await adminRoleService.updateRole(roleId, {
      ...(hasName ? { name: normalizeRoleName(request.body.name) } : {}),
      ...(hasDescription
        ? {
            description:
              optionalNullableString(request.body.description, "description") ??
              null,
          }
        : {}),
    });

    response.status(200).json({ success: true, data: role });
  };

  replacePermissions: RequestHandler = async (request, response) => {
    const roleId = requireString(request.params.id, "role id");
    const permissionNames = requireStringArray(
      request.body?.permissionNames,
      "permissionNames",
    );

    const role = await adminRoleService.replaceRolePermissions(
      roleId,
      permissionNames,
    );

    response.status(200).json({ success: true, data: role });
  };

  delete: RequestHandler = async (request, response) => {
    const roleId = requireString(request.params.id, "role id");
    await adminRoleService.deleteRole(roleId);
    response.status(204).send();
  };
}

export const adminRoleController = new AdminRoleController();
