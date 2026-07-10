import { db } from "../database/db";
import type { PermissionName } from "../config/rbac";

export class AuthorizationService {
  async hasAllPermissions(
    userId: string,
    requiredPermissions: readonly PermissionName[],
  ): Promise<boolean> {
    if (requiredPermissions.length === 0) {
      return true;
    }

    const assignedPermissions = await db
      .selectFrom("user_roles as userRole")
      .innerJoin(
        "role_permissions as rolePermission",
        "rolePermission.role_id",
        "userRole.role_id",
      )
      .innerJoin(
        "permissions as permission",
        "permission.id",
        "rolePermission.permission_id",
      )
      .select("permission.name")
      .where("userRole.user_id", "=", userId)
      .where("permission.name", "in", [...requiredPermissions])
      .execute();

    const assignedPermissionNames = new Set(
      assignedPermissions.map((permission) => permission.name),
    );

    return requiredPermissions.every((permissionName) =>
      assignedPermissionNames.has(permissionName),
    );
  }
}

export const authorizationService = new AuthorizationService();
