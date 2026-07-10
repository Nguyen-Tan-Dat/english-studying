import type { Transaction } from "kysely";

import { db } from "../database/db";
import type { Database } from "../database/types";
import { ApiError } from "../utils/api-error";

export interface CreateRoleInput {
  name: string;
  description: string | null;
  permissionNames: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string | null;
}

interface PermissionRow {
  id: string;
  name: string;
  description: string | null;
}

interface RoleRow {
  id: string;
  name: string;
  description: string | null;
  permissionId: string | null;
  permissionName: string | null;
  permissionDescription: string | null;
}

export class AdminRoleService {
  async listRoles() {
    const rows = await db
      .selectFrom("roles as role")
      .leftJoin(
        "role_permissions as rolePermission",
        "rolePermission.role_id",
        "role.id",
      )
      .leftJoin(
        "permissions as permission",
        "permission.id",
        "rolePermission.permission_id",
      )
      .select([
        "role.id",
        "role.name",
        "role.description",
        "permission.id as permissionId",
        "permission.name as permissionName",
        "permission.description as permissionDescription",
      ])
      .orderBy("role.name", "asc")
      .orderBy("permission.name", "asc")
      .execute();

    return this.mapRoleRows(rows);
  }

  async getRoleById(roleId: string) {
    const rows = await db
      .selectFrom("roles as role")
      .leftJoin(
        "role_permissions as rolePermission",
        "rolePermission.role_id",
        "role.id",
      )
      .leftJoin(
        "permissions as permission",
        "permission.id",
        "rolePermission.permission_id",
      )
      .select([
        "role.id",
        "role.name",
        "role.description",
        "permission.id as permissionId",
        "permission.name as permissionName",
        "permission.description as permissionDescription",
      ])
      .where("role.id", "=", roleId)
      .orderBy("permission.name", "asc")
      .execute();

    const role = this.mapRoleRows(rows)[0];

    if (!role) {
      throw ApiError.notFound("Role was not found");
    }

    return role;
  }

  async listPermissions(): Promise<PermissionRow[]> {
    return db
      .selectFrom("permissions")
      .select(["id", "name", "description"])
      .orderBy("name", "asc")
      .execute();
  }

  async createRole(input: CreateRoleInput) {
    const roleId = await db.transaction().execute(async (transaction) => {
      const permissionIds = await this.resolvePermissionIds(
        transaction,
        input.permissionNames,
      );

      const role = await transaction
        .insertInto("roles")
        .values({
          name: input.name,
          description: input.description,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await this.insertRolePermissions(transaction, role.id, permissionIds);
      return role.id;
    });

    return this.getRoleById(roleId);
  }

  async updateRole(roleId: string, input: UpdateRoleInput) {
    await db.transaction().execute(async (transaction) => {
      const existingRole = await transaction
        .selectFrom("roles")
        .select(["id", "name"])
        .where("id", "=", roleId)
        .executeTakeFirst();

      if (!existingRole) {
        throw ApiError.notFound("Role was not found");
      }

      if (
        existingRole.name === "super_admin" &&
        input.name !== undefined &&
        input.name !== "super_admin"
      ) {
        throw ApiError.badRequest("The super_admin role cannot be renamed");
      }

      await transaction
        .updateTable("roles")
        .set(input)
        .where("id", "=", roleId)
        .executeTakeFirstOrThrow();
    });

    return this.getRoleById(roleId);
  }

  async replaceRolePermissions(roleId: string, permissionNames: string[]) {
    await db.transaction().execute(async (transaction) => {
      const role = await transaction
        .selectFrom("roles")
        .select(["id", "name"])
        .where("id", "=", roleId)
        .executeTakeFirst();

      if (!role) {
        throw ApiError.notFound("Role was not found");
      }

      if (role.name === "super_admin") {
        throw ApiError.badRequest(
          "Permissions of the super_admin role are managed by the RBAC seed",
        );
      }

      const permissionIds = await this.resolvePermissionIds(
        transaction,
        permissionNames,
      );

      await transaction
        .deleteFrom("role_permissions")
        .where("role_id", "=", roleId)
        .execute();

      await this.insertRolePermissions(transaction, roleId, permissionIds);
    });

    return this.getRoleById(roleId);
  }

  async deleteRole(roleId: string): Promise<void> {
    await db.transaction().execute(async (transaction) => {
      const role = await transaction
        .selectFrom("roles")
        .select(["id", "name"])
        .where("id", "=", roleId)
        .executeTakeFirst();

      if (!role) {
        throw ApiError.notFound("Role was not found");
      }

      if (role.name === "super_admin") {
        throw ApiError.badRequest("The super_admin role cannot be deleted");
      }

      await transaction
        .deleteFrom("roles")
        .where("id", "=", roleId)
        .executeTakeFirstOrThrow();
    });
  }

  private async resolvePermissionIds(
    transaction: Transaction<Database>,
    permissionNames: string[],
  ): Promise<string[]> {
    const uniquePermissionNames = [...new Set(permissionNames)];

    if (uniquePermissionNames.length === 0) {
      return [];
    }

    const permissions = await transaction
      .selectFrom("permissions")
      .select(["id", "name"])
      .where("name", "in", uniquePermissionNames)
      .execute();

    const foundPermissionNames = new Set(
      permissions.map((permission) => permission.name),
    );
    const unknownPermissionNames = uniquePermissionNames.filter(
      (permissionName) => !foundPermissionNames.has(permissionName),
    );

    if (unknownPermissionNames.length > 0) {
      throw ApiError.badRequest("One or more permissions do not exist", {
        unknownPermissionNames,
      });
    }

    return permissions.map((permission) => permission.id);
  }

  private async insertRolePermissions(
    transaction: Transaction<Database>,
    roleId: string,
    permissionIds: string[],
  ): Promise<void> {
    if (permissionIds.length === 0) {
      return;
    }

    await transaction
      .insertInto("role_permissions")
      .values(
        permissionIds.map((permissionId) => ({
          role_id: roleId,
          permission_id: permissionId,
        })),
      )
      .onConflict((conflict) =>
        conflict.columns(["role_id", "permission_id"]).doNothing(),
      )
      .execute();
  }

  private mapRoleRows(rows: RoleRow[]) {
    const roles = new Map<
      string,
      {
        id: string;
        name: string;
        description: string | null;
        permissions: PermissionRow[];
      }
    >();

    for (const row of rows) {
      const role = roles.get(row.id) ?? {
        id: row.id,
        name: row.name,
        description: row.description,
        permissions: [],
      };

      if (row.permissionId && row.permissionName) {
        role.permissions.push({
          id: row.permissionId,
          name: row.permissionName,
          description: row.permissionDescription,
        });
      }

      roles.set(row.id, role);
    }

    return [...roles.values()];
  }
}

export const adminRoleService = new AdminRoleService();
