import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'

export default defineConfig<ConfigOptions>({
    use: {
        nuxt: {
            host: process.env.TEST_APP_URL!,
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
