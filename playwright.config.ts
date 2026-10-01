import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  timeout: 60_000,
  use: { baseURL: "http://localhost:3000", channel: process.env.PLAYWRIGHT_CHANNEL, trace: "off", screenshot: "off", video: "off" },
  projects: [
    { name: "chromium", testIgnore: /backend\.spec\.ts/, use: { ...devices["Desktop Chrome"] } },
    { name: "backend", testMatch: /backend\.spec\.ts/, use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "pnpm dev --hostname localhost --port 3000",
    url: "http://localhost:3000/auth/login",
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: { NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080" },
  },
})
