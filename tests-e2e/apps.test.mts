import { expect, test } from '@nuxt/test-utils/playwright'
import { uuidv4 } from 'uuidv7'

test('Apps test', async ({ page, goto, context }) => {
    const orgName = `Org Test ${uuidv4().slice(0, 8)}`

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
        const appName = `Habit Tool - ${osTestType}`
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
})
