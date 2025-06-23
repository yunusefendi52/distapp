import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'

export default defineConfig<ConfigOptions>({
    workers: 1,
    webServer: {
        command: './setup-test.sh',
        url: 'http://localhost:3000',
        reuseExistingServer: false,
        stdout: 'pipe',
        stderr: 'pipe',
    },
    use: {
        screenshot: 'only-on-failure',
        nuxt: {
            host: 'http://localhost:3000',
        },
    },
    testDir: './tests-e2e',
    expect: {
        timeout: 12000,
    },
    projects: [
        { name: 'setup', testMatch: '**/*.setup.mts' },
        {
            name: 'Chromium',
            dependencies: ['setup'],
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'playwright/.auth/user.json',
            },
        },
    ],
})
