import { expect, test } from '@nuxt/test-utils/playwright'

test('Can open distapp and show get started', async ({ page, goto, context }) => {
    await context.clearCookies()
    await goto('/')
    await expect(page.getByText('Get Started')).toHaveCount(1)
})

test('Logged in user open distapp and show go to apps', async ({ page, goto, context }) => {
    await goto('/')
    await expect(page.getByText('Go To Apps')).toHaveCount(1)
})
