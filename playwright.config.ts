import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './server/tests/e2e',
  testMatch: ['**/*.spec.ts'],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1, // SQLite compartida: evita que los tests se pisen
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
