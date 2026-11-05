import { expect, test } from '@nuxt/test-utils/playwright'

test('Logged in user open distapp and show go to apps', async ({ page, goto, context }) => {
    await goto('/')
    await expect(page.getByTestId('hero_cta_btn')).toHaveText('Go To Apps')
})
