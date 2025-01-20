import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
    test: {
        dir: './tests',
        environment: 'nuxt',
    },
})
