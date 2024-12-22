import { expect, test } from '@nuxt/test-utils/playwright'
import { uuidv4 } from 'uuidv7'

function generateTestId() {
    return uuidv4().slice(0, 8)
}

test('Apps test', async ({ page, goto, context }) => {
    const orgName = `Org Test ${generateTestId()}`

    await test.step('User can create organization', async () => {
        await goto('/apps')
        await page.getByText('Add app').click()
        await page.getByText('Select organization').click()
        await page.getByTestId('addNewOrgbtn').click()
        await page.getByTestId('orgname').fill(orgName)
        await page.getByTestId('orgsavebtn').click()
        await page.getByText('Select organization').click()
        await expect(page.getByText(orgName)).toHaveCount(2)
    })

    const osTestTypes = ['Android', 'iOS']
    for (const osTestType of osTestTypes) {
        const index = osTestTypes.indexOf(osTestType)

        const appName = `Habit Tool - ${osTestType} - ${generateTestId()}`
        await test.step(`User can create new app ${osTestType} from newly created org`, async () => {
            if (index > 0) {
                await page.getByText('All Apps').click()
                await page.getByText('Add app').click()
            }
            await page.getByText('Select organization').click()
            await page.getByLabel(orgName).getByText(orgName).click()
            await page.getByText('Select OS Type').click()
            await page.getByLabel(osTestType).click()
            await page.getByTestId('inputAppName').fill(appName)
            await page.getByText('Save').click()
            await expect(page.getByText(appName)).toHaveCount(1)
            await expect(page.getByTestId('createAppDialogForm')).toBeHidden()
        })

        await test.step('User can create app API key', async () => {
            await page.getByTestId('a_menus').getByText(orgName).click()
            await page.getByText(appName).click()
            await page.getByTestId('settings_app_btn').click()
            await expect(page).toHaveURL(/.*app-info/)
            await page.getByText('API Keys').click()
            await expect(page).toHaveURL(/.*api-keys/)
            await page.getByText('Generate Token').click()
            await expect(page.getByTestId('tkn_spn')).toContainText('ey')
            const appApiKey = await page.getByTestId('tkn_spn').innerText()
        })
    }

    await test.step('User admin can delete org', async () => {
        await page.getByTestId('a_menus').getByText(orgName).click()
        await page.getByTestId('settings_btn').click()
        await page.getByRole('menuitem').nth(2).click()
        const orgId = await page.getByTestId('org_name_span').textContent()
        await page.getByTestId('orgName').fill(orgId!)
        await page.getByTestId('deleteOrgBtn').click()
        await expect(page.getByLabel('Danger')).toHaveCount(0)
        await expect(page.getByText(orgName)).toHaveCount(0)
    })
})
