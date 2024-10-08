import { expect, test } from '@nuxt/test-utils/playwright'

test('Can open distapp and show login page', async ({ page, goto }) => {
    await goto('/')
    await expect(page.getByText('DistApp')).toHaveCount(1)
})
