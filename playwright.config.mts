import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'

export default defineConfig<ConfigOptions>({
    webServer: {
        command: 'bun run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        stdout: 'ignore',
        stderr: 'pipe',
    },
    use: {
        nuxt: {
            host: 'http://localhost:3000',
        },
    },
    testDir: './tests-e2e',
    projects: [
        { name: 'Setup', testMatch: '**/*.setup.mts' },
        {
            name: 'Chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'playwright/.auth/user.json',
            },
        },
    ],
})
