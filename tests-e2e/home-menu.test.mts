import { expect, test } from '@nuxt/test-utils/playwright'

test('Changing org should not hide app menu when loading', async ({ page, goto, context }) => {
    await goto('/apps')
    await expect(page.getByTestId('amenu-1')).toBeVisible()
    await page.getByTestId('amenu-1').click()
    await expect(page.getByTestId('amenu-1')).toBeVisible()
    await expect(page.getByTestId('menu-loading')).toBeVisible()
    await page.waitForResponse(r => r.request().url().includes('list-orgs'))
    await expect(page.getByTestId('menu-loading')).toHaveCount(0)
})
