import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup/environment.ts"],
    pool: "forks",
    fileParallelism: false,
    testTimeout: 15_000,
    hookTimeout: 30_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
      include: ["src/**/*.ts"],
      exclude: [
        "src/server.ts",
        "src/database/check-connection.ts",
        "src/database/grant-super-admin.ts",
        "src/database/seed-rbac.ts",
        "src/database/rbac-seeder.ts",
        "src/database/types.ts",
        "src/types/**/*.d.ts",
      ],
      thresholds: {
        statements: 65,
        branches: 45,
        functions: 70,
        lines: 65,
      },
    },
  },
});
