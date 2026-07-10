import { closeDatabaseConnection, db } from "./db";
import { ApiError } from "../utils/api-error";

async function grantSuperAdmin(identifier: string): Promise<void> {
  const user = await db
    .selectFrom("users")
    .select(["id", "email", "user_name"])
    .where((expressionBuilder) =>
      expressionBuilder.or([
        expressionBuilder("email", "=", identifier),
        expressionBuilder("user_name", "=", identifier),
      ]),
    )
    .executeTakeFirst();

  if (!user) {
    throw ApiError.notFound(`User "${identifier}" was not found`);
  }

  const role = await db
    .selectFrom("roles")
    .select(["id", "name"])
    .where("name", "=", "super_admin")
    .executeTakeFirst();

  if (!role) {
    throw ApiError.notFound(
      "The super_admin role does not exist. Run npm run db:seed:rbac first.",
    );
  }

  await db
    .insertInto("user_roles")
    .values({
      user_id: user.id,
      role_id: role.id,
    })
    .onConflict((conflict) =>
      conflict.columns(["user_id", "role_id"]).doNothing(),
    )
    .execute();

  console.log(`✅ Granted super_admin to ${user.email} (${user.user_name}).`);
}

const identifier = process.argv[2]?.trim();

if (!identifier) {
  console.error("Usage: npm run db:grant-super-admin -- <email-or-username>");
  process.exitCode = 1;
} else {
  grantSuperAdmin(identifier)
    .catch((error: unknown) => {
      console.error("❌ Unable to grant super_admin:", error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await closeDatabaseConnection();
    });
}
