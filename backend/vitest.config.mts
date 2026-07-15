import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';

dotenv.config({ path: '.env.test', override: false });

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup/test-env.ts'],
    globalSetup: ['./tests/setup/global-setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/__tests__/**/*.test.ts', 'tests/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**', 'coverage/**'],
    testTimeout: 10_000,
    hookTimeout: 10_000,
    maxWorkers: 4,
    minWorkers: 1,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/server.ts',
        'src/**/__tests__/**',
        'src/infrastructure/database/migrations/**',
        'src/infrastructure/database/seeds/**'
      ]
    }
  }
});
