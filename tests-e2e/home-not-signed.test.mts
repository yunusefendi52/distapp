import { expect, test } from '@nuxt/test-utils/playwright'

test.use({ storageState: { cookies: [], origins: [] } });

test('Can open distapp and show get started', async ({ page, goto, context }) => {
    await goto('/')
    await expect(page.getByText('Get Started')).toHaveCount(1)
})
