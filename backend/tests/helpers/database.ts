import { sql } from "kysely";

import { seedRbac } from "../../src/database/rbac-seeder";
import { db } from "../../src/database/db";

export async function resetTestData(): Promise<void> {
  await sql`
    TRUNCATE TABLE
      review_logs,
      user_vocabularies,
      english_words,
      vietnamese_meanings,
      reading_annotations,
      reading_reflections,
      reading_materials,
      daily_journals,
      role_permissions,
      user_roles,
      tokens,
      users,
      permissions,
      roles
    RESTART IDENTITY CASCADE
  `.execute(db);

  await seedRbac(db);
}

export async function grantRoleToUser(
  userId: string,
  roleName: string,
): Promise<void> {
  const role = await db
    .selectFrom("roles")
    .select("id")
    .where("name", "=", roleName)
    .executeTakeFirstOrThrow();

  await db
    .insertInto("user_roles")
    .values({ user_id: userId, role_id: role.id })
    .onConflict((conflict) =>
      conflict.columns(["user_id", "role_id"]).doNothing(),
    )
    .execute();
}
