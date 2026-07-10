import fs from "node:fs/promises";
import path from "node:path";

import dotenv from "dotenv";
import { Client, type ClientConfig } from "pg";

const envPath = path.resolve(process.cwd(), ".env.test");
dotenv.config({ path: envPath, override: true, quiet: true });

function getSslConfig(): ClientConfig["ssl"] {
  return process.env.DB_SSL?.trim().toLowerCase() === "true"
    ? { rejectUnauthorized: false }
    : undefined;
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function resetTestDatabase(): Promise<void> {
  const connectionString = process.env.TEST_DATABASE_URL?.trim();

  if (!connectionString) {
    throw new Error(
      "Missing TEST_DATABASE_URL. Copy .env.test.example to .env.test first.",
    );
  }

  const targetUrl = new URL(connectionString);
  const databaseName = decodeURIComponent(
    targetUrl.pathname.replace(/^\//, ""),
  );

  if (!databaseName || !/^[a-zA-Z0-9_]+$/.test(databaseName)) {
    throw new Error("TEST_DATABASE_URL contains an invalid database name");
  }

  if (!databaseName.toLowerCase().endsWith("_test")) {
    throw new Error(
      `Safety check refused to reset database "${databaseName}". Test database names must end with _test.`,
    );
  }

  const maintenanceUrl = new URL(targetUrl.toString());
  maintenanceUrl.pathname = "/postgres";

  const maintenanceClient = new Client({
    connectionString: maintenanceUrl.toString(),
    ssl: getSslConfig(),
  });

  await maintenanceClient.connect();

  try {
    const existingDatabase = await maintenanceClient.query<{ exists: boolean }>(
      "SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) AS exists",
      [databaseName],
    );

    if (!existingDatabase.rows[0]?.exists) {
      await maintenanceClient.query(
        `CREATE DATABASE ${quoteIdentifier(databaseName)}`,
      );
      console.log(`✅ Created test database: ${databaseName}`);
    }
  } finally {
    await maintenanceClient.end();
  }

  const testClient = new Client({
    connectionString,
    ssl: getSslConfig(),
  });

  await testClient.connect();

  try {
    await testClient.query("DROP SCHEMA public CASCADE");
    await testClient.query("CREATE SCHEMA public");

    const schemaPath = path.resolve(
      process.cwd(),
      "src/database/schema/tables.sql",
    );
    const schemaSql = await fs.readFile(schemaPath, "utf8");
    await testClient.query(schemaSql);

    console.log(`✅ Rebuilt PostgreSQL schema in: ${databaseName}`);
  } finally {
    await testClient.end();
  }
}

resetTestDatabase().catch((error: unknown) => {
  console.error("❌ Unable to reset test database:", error);
  process.exitCode = 1;
});
