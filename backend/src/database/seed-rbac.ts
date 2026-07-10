import { RBAC_TABLES, CRUD_ACTIONS } from "../config/rbac";
import { closeDatabaseConnection } from "./db";
import { seedRbac } from "./rbac-seeder";

seedRbac()
  .then(() => {
    console.log(
      `✅ Seeded ${RBAC_TABLES.length * CRUD_ACTIONS.length} CRUD permissions, the user role, and the super_admin role.`,
    );
  })
  .catch((error: unknown) => {
    console.error("❌ Unable to seed RBAC:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabaseConnection();
  });
