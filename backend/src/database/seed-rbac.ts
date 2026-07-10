import { CRUD_ACTIONS, RBAC_TABLES, type CrudAction } from "../config/rbac";
import { closeDatabaseConnection, db } from "./db";

const ACTION_DESCRIPTIONS: Record<CrudAction, string> = {
  create: "Create records in",
  read: "Read records from",
  update: "Update records in",
  delete: "Delete records from",
};

async function seedRbac(): Promise<void> {
  await db.transaction().execute(async (transaction) => {
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

  console.log(
    `✅ Seeded ${RBAC_TABLES.length * CRUD_ACTIONS.length} CRUD permissions and the super_admin role.`,
  );
}

seedRbac()
  .catch((error: unknown) => {
    console.error("❌ Unable to seed RBAC:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabaseConnection();
  });
