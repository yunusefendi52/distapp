import { test as setup, expect } from '@playwright/test'
import path from 'path';

const authFile = path.join(import.meta.dirname, '../../playwright/.auth/user.json');

setup('Authenticate', async ({ page }) => {
    await page.goto('http://localhost:3000/signin')
    await page.locator('[name="username"]').fill('usertest1')
    await page.locator('[name="password"]').fill('a5756f781e0e433986364b82de545c3b')
    await page.getByTestId('sign_in_btn').click()
    await expect(page.getByTestId('sign_in_btn')).toHaveCount(0)

    await page.context().storageState({ path: authFile })
})