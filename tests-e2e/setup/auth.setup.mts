import { test as setup, expect } from '@playwright/test'
import path from 'path';

const authFile = path.join(import.meta.dirname, '../../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
    const domain = process.env.TEST_APP_URL!.replaceAll('https://', '').replaceAll('http://', '').replaceAll(':3000', '')
    await page.context().addCookies([{
        name: cookieAuthKey,
        value: process.env.TEST_APP_AUTH_COOKIES!,
        httpOnly: false,
        secure: true,
        sameSite: 'Lax',
        path: '/',
        domain: domain,
        expires: 90 * 86400,
    }])

    await page.context().storageState({ path: authFile });
})