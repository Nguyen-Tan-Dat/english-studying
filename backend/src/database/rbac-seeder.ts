import type { Kysely } from "kysely";

import { CRUD_ACTIONS, RBAC_TABLES, type CrudAction } from "../config/rbac";
import type { Database } from "./types";
import { db } from "./db";

const ACTION_DESCRIPTIONS: Record<CrudAction, string> = {
  create: "Create records in",
  read: "Read records from",
  update: "Update records in",
  delete: "Delete records from",
};

export async function seedRbac(database: Kysely<Database> = db): Promise<void> {
  await database.transaction().execute(async (transaction) => {
    for (const tableName of RBAC_TABLES) {
      for (const action of CRUD_ACTIONS) {
        const permissionName = `${tableName}.${action}`;

        await transaction
          .insertInto("permissions")
          .values({
            name: permissionName,
            description: `${ACTION_DESCRIPTIONS[action]} the ${tableName} table`,
          })
          .onConflict((conflict) =>
            conflict.column("name").doUpdateSet({
              description: `${ACTION_DESCRIPTIONS[action]} the ${tableName} table`,
            }),
          )
          .execute();
      }
    }

    await transaction
      .insertInto("roles")
      .values({
        name: "user",
        description: "Default role assigned to registered users",
      })
      .onConflict((conflict) =>
        conflict.column("name").doUpdateSet({
          description: "Default role assigned to registered users",
        }),
      )
      .execute();

    const superAdminRole = await transaction
      .insertInto("roles")
      .values({
        name: "super_admin",
        description: "System administrator with every available permission",
      })
      .onConflict((conflict) =>
        conflict.column("name").doUpdateSet({
          description: "System administrator with every available permission",
        }),
      )
      .returning("id")
      .executeTakeFirstOrThrow();

    const permissions = await transaction
      .selectFrom("permissions")
      .select("id")
      .execute();

    if (permissions.length > 0) {
      await transaction
        .insertInto("role_permissions")
        .values(
          permissions.map((permission) => ({
            role_id: superAdminRole.id,
            permission_id: permission.id,
          })),
        )
        .onConflict((conflict) =>
          conflict.columns(["role_id", "permission_id"]).doNothing(),
        )
        .execute();
    }
  });
}
