import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'

export default defineConfig<ConfigOptions>({
    use: {
        nuxt: {
            host: 'http://localhost:3000'
        },
    },
    testDir: './tests-e2e',
    projects: [
        // {
        //     name: 'Setup global',
        //     testMatch: /global\.setup\.mts/,
        // },
        {
            name: 'Chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: {
                    cookies: [{
                        name: 'app-auth',
                        value: process.env.APP_MOCK_COOKIE!,
                        httpOnly: false,
                        secure: true,
                        sameSite: 'Lax',
                        path: '/',
                        domain: 'localhost',
                        expires: -1,
                    }],
                    origins: [],
                },
            },
            // dependencies: ['Setup global'],
        },
    ],
    // ...
})
