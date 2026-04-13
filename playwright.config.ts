import { defineConfig } from '@playwright/test';

const testPort = 4100;

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  timeout: 30_000,
  use: {
    baseURL: `http://127.0.0.1:${testPort}`,
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build && tsx server.ts',
    url: `http://127.0.0.1:${testPort}/api/health`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      JWT_SECRET: 'playwright-test-secret',
      PORT: String(testPort),
      TEST_MODE: '1',
    },
  },
});
