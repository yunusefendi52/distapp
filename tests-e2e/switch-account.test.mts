import { expect, test } from '@nuxt/test-utils/playwright'

test.use({ storageState: { cookies: [], origins: [] } });

test('Add and switch account', async ({ page, goto, context }) => {
    await goto('/')
    await page.getByText('Get Started').click()
    
    await page.locator('[name="username"]').fill('usertest1')
    await page.locator('[name="password"]').fill('a5756f781e0e433986364b82de545c3b')
    await page.getByTestId('sign_in_btn').click()

    await page.getByText('Go To Apps').click()

    await page.getByTestId('b_more_btn').click()
    await expect(page.getByText('(Current)')).toContainText("usertest1")
    await page.getByText('Add Account').click()

    // Try to login with other account
    await page.locator('[name="username"]').fill('usertest2')
    await page.locator('[name="password"]').fill('963a71f1868248df912e7488e02233f0')
    await page.getByTestId('sign_in_btn').click()

    // Go to apps where the UI has switch account
    await page.getByText('Go To Apps').click()

    // Check if have two accounts
    await page.getByTestId('b_more_btn').click()
    await expect(page.getByText('(Current)')).toContainText("usertest2")
    await expect(page.getByText('usertest1')).toHaveText('usertest1')

    // Lets switch account
    await page.getByText('usertest1').click()
    await page.getByText('Go To Apps').click()

    // Check if switch succeeded
    await page.getByTestId('b_more_btn').click()
    await expect(page.getByText('(Current)')).toContainText("usertest1")
    await expect(page.getByText('usertest2')).toHaveText('usertest2')

    // Lets try logout current account
    await page.getByTestId('b_sign_out_btn').click()

    // Go to apps and should switch to first account if any
    await page.getByText('Go To Apps').click()
    await page.getByTestId('b_more_btn').click()
    await expect(page.getByText('usertest2')).toContainText('usertest2')
    await expect(page.getByText('usertest1')).toHaveCount(0)
})
