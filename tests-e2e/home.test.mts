import { expect, test } from '@nuxt/test-utils/playwright'
import { uuidv7 } from 'uuidv7'

test('Can open distapp and show login page', async ({ page, goto }) => {
    await goto('/')
    await expect(page.getByText('DistApp')).toHaveCount(1)
})

test('User can add organization', async ({ context, goto, page }) => {
    await goto('/')
    await page.locator('div.p-splitbutton:nth-child(1) > button:nth-child(2)').click()
    await page.locator('#pv_id_1_overlay_0_label').click()
    await expect(page.locator('.p-dialog-title', {
        hasText: 'Add Organization',
    })).toBeVisible()
    const testId = uuidv7()
    const expectedOrgName = `Org Testing ${testId}`
    const expectedOrgNameNormalized = `/orgs/org-testing-${testId}`
    await page.getByTestId('orgname').fill(expectedOrgName)
    await page.getByTestId('orgname').press('Enter')
    await expect(page.getByText(expectedOrgName)).toBeVisible()
    await expect(page.locator('//a', {
        hasText: expectedOrgName,
    })).toHaveAttribute('href', expectedOrgNameNormalized)
})