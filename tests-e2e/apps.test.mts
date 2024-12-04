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
        const appName = `Habit Tool - ${osTestType} - ${generateTestId()}`
        await test.step(`User can create new app ${osTestType} from newly created org`, async () => {
            await page.getByText('Select organization').click()
            await page.getByLabel(orgName).getByText(orgName).click()
            await page.getByText('Select OS Type').click()
            await page.getByLabel(osTestType).click()
            await page.getByTestId('inputAppName').fill(appName)
            await page.getByText('Save').click()
            await expect(page.getByText(appName)).toHaveCount(1)
            await expect(page.getByTestId('createAppDialogForm')).toBeHidden()
            await page.getByText('Add app').click()
        })
    }
    await page.keyboard.press('Escape')

    await test.step('User admin can delete org', async () => {
        await page.getByTestId('a_menus').getByText(orgName).click()
        await page.getByLabel('Settings').click()
        await page.getByLabel('Danger').click()
        const orgId = await page.getByTestId('org_name_span').textContent()
        await page.getByTestId('orgName').fill(orgId!)
        await page.getByTestId('deleteOrgBtn').click()
        await expect(page.getByLabel('Danger')).toHaveCount(0)
        await expect(page.getByText(orgName)).toHaveCount(0)
    })
})
