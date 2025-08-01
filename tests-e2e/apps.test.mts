import { expect, test } from '@nuxt/test-utils/playwright'
import { uuidv4 } from 'uuidv7'
import child_process from 'node:child_process'
import util from 'util'
const exec = util.promisify(child_process.exec)
import slugify from '~/server/utils/slugify.mjs';
const { normalizeName } = slugify;

function generateTestId() {
    return uuidv4().slice(0, 8)
}

test('Apps test', async ({ page, goto, context, request }) => {
    const orgName = `Org Test ${generateTestId()}`

    await test.step('User can create organization', async () => {
        await goto('/apps')
        await page.getByLabel('Add App').first().click()
        await page.getByText('Select organization').click()
        await page.getByTestId('addNewOrgbtn').click()
        await page.getByTestId('orgname').fill(orgName)
        await page.getByTestId('orgsavebtn').click()
        await expect(page.getByText(orgName)).toHaveCount(2)
    })

    const osTestTypes = ['Android', 'iOS', 'Windows', 'MacOS'] as const
    for (const osTestType of osTestTypes) {
        const index = osTestTypes.indexOf(osTestType)

        const appName = `Habit Tool - ${osTestType} - ${generateTestId()}`
        await test.step(`User can create new app ${osTestType} from newly created org`, async () => {
            if (index > 0) {
                await page.getByText('All Apps').click()
                await page.getByLabel('Add App').first().click()

                // First time created organization already selected org
                await page.getByText('Select organization').click()
                await page.getByLabel(orgName).getByText(orgName).click()
            }
            await page.getByTestId('dropdown_platform').click()
            await page.getByLabel(osTestType).click()
            await page.getByTestId('inputAppName').fill(appName)
            await page.getByText('Save').click()
            await expect(page.getByText(appName)).toHaveCount(1)
            await expect(page.getByTestId('createAppDialogForm')).toBeHidden()
        })

        let groupName = 'My Group App'
        await test.step('User can create group app', async () => {
            await page.getByTestId('a_menus').getByText(orgName).click()
            await page.getByText(appName).click()
            await page.getByLabel('Groups').click()
            await page.getByText('New Group').click()
            await page.getByTestId('group_name').fill(groupName)
            await page.getByText('Save').click()
        })

        let appSlug: string
        let appApiKey: string
        let orgId: string
        let appId: string

        await test.step('User can create app API key', async () => {
            await page.getByTestId('a_menus').getByText(orgName).click()
            await page.getByText(appName).click()
            await page.getByTestId('settings_app_btn').click()
            await expect(page).toHaveURL(/.*app-info/)
            appSlug = await page.getByTestId('slug_input').inputValue()
            orgId = await page.getByTestId('orgid_input').inputValue()
            appId = await page.getByTestId('appid_input').inputValue()
            await page.getByText('API Keys').click()
            await expect(page).toHaveURL(/.*api-keys/)
            await page.getByText('Generate Token').click()
            await expect(page.getByTestId('tkn_spn')).toBeVisible()
            appApiKey = await page.getByTestId('tkn_spn').innerText()
            expect(appApiKey).toContain('ey')
        })

        const distappUrl = 'http://localhost:3000'
        const cliCommand = `DISTAPP_CLI_URL="${distappUrl}" node cli/cli.mjs`

        if (osTestType === 'Android') {
            await test.step(`User can upload artifact ${osTestType} AAB with API keys using CLI`, async () => {
                // Needed to give some time time download bundletool
                test.setTimeout(90_000)

                const { stderr, stdout } = await exec(`${cliCommand} \\
                    distribute \\
                    --file "tests/tests_artifacts/app-release.aab" \\
                    --slug "${appSlug}" \\
                    --api-key "${appApiKey}"`)
                expect(stderr).toBeFalsy()
                expect(stdout).toContain('Finished Distributing')
                expect(stdout).toContain('with generated APK')

                // test.setTimeout(30_000)
            })
            await test.step(`User can upload artifact ${osTestType} APK with API keys using CLI`, async () => {
                const { stderr, stdout } = await exec(`${cliCommand} \\
                    distribute \\
                    --file "tests/tests_artifacts/app-arm64-v8a-release.apk" \\
                    --slug "${appSlug}" \\
                    --api-key "${appApiKey}"`)
                expect(stderr).toBeFalsy()
                expect(stdout).toContain('Finished Distributing')
                expect(stdout).not.toContain('with generated APK')
            })
            await test.step(`User can upload artifact ${osTestType} APK to group with API keys using CLI`, async () => {
                const { stderr, stdout } = await exec(`${cliCommand} \\
                    distribute \\
                    --file "tests/tests_artifacts/app-arm64-v8a-release.apk" \\
                    --slug "${appSlug}" \\
                    --api-key "${appApiKey}" \\
                    --group "${normalizeName(groupName)}"`)
                expect(stderr).toBeFalsy()
                expect(stdout).toContain('Finished Distributing')
                expect(stdout).toContain('to groups')
                expect(stdout).not.toContain('with generated APK')
            })
            await test.step(`User should not able upload artifact arbitrary ZIP to ${osTestType}`, async () => {
                await expect(exec(`${cliCommand} \\
                distribute \\
                --file "tests/tests_artifacts/release.zip" \\
                --slug "${appSlug}" \\
                --api-key "${appApiKey}"`)).rejects.toThrow(/Version Name and Version Code are required/)
                await expect(exec(`${cliCommand} \\
                distribute \\
                --file "tests/tests_artifacts/release.zip" \\
                --slug "${appSlug}" \\
                --api-key "${appApiKey}" \\
                --version-code 1 \\
                --version-name 1`)).rejects.toThrow(/You cannot set version in your platform type/)
            })
            await test.step(`User can get the latest app version`, async () => {
                const resp = await request.get(`${distappUrl}/api/apps/app-version`, {
                    params: {
                        orgId: orgId,
                        appId: appId,
                    },
                })
                expect(resp.ok()).toBeTruthy()
                const respJson = JSON.parse(await resp.text())
                expect(respJson.groupName).toBeFalsy()
                expect(respJson.releaseId).toEqual(3)
                expect(respJson.installLink).toBeFalsy()
            })
            await test.step(`User can get the latest app version spesific group`, async () => {
                const resp = await request.get(`${distappUrl}/api/apps/app-version`, {
                    params: {
                        orgId: orgId,
                        appId: appId,
                        group: normalizeName(groupName),
                    },
                })
                expect(resp.ok()).toBeTruthy()
                const respJson = JSON.parse(await resp.text())
                expect(respJson.groupName).toEqual(groupName)
                expect(respJson.releaseId).toEqual(3)
                expect(respJson.installLink).toBeTruthy()
                expect(respJson.installLink).toContain('artifactId')
            })
        } else if (osTestType === 'iOS') {
            await test.step(`User can upload artifact ${osTestType} IPA with API keys using CLI`, async () => {
                const { stderr, stdout } = await exec(`${cliCommand} \\
                    distribute \\
                    --file "tests/tests_artifacts/testapp.ipa" \\
                    --slug "${appSlug}" \\
                    --api-key "${appApiKey}"`)
                expect(stderr).toBeFalsy()
                expect(stdout).toContain('Finished Distributing')
            })
            await test.step(`User should not able to upload arbitrary file to ${osTestType}`, async () => {
                await expect(exec(`${cliCommand} \\
                    distribute \\
                    --file "tests/tests_artifacts/release.zip" \\
                    --slug "${appSlug}" \\
                    --api-key "${appApiKey}"`)).rejects.toThrow(/Version Name and Version Code are required/)
                await expect(exec(`${cliCommand} \\
                    distribute \\
                    --file "tests/tests_artifacts/release.zip" \\
                    --slug "${appSlug}" \\
                    --api-key "${appApiKey}" \\
                    --version-code 1 \\
                    --version-name 1`)).rejects.toThrow(/You cannot set version in your platform type/)
            })
        } else if (osTestType === 'Windows' || osTestType === 'MacOS' || osTestType === 'Linux') {
            await test.step(`User should not able to upload zip file ${osTestType} if didn't specify version`, async () => {
                await expect(exec(`${cliCommand} \\
                    distribute \\
                    --file "tests/tests_artifacts/release.zip" \\
                    --slug "${appSlug}" \\
                    --api-key "${appApiKey}"`)).rejects.toThrow(/Version Name and Version Code are required/)
            })
            await test.step(`User can upload zip file ${osTestType} with API keys using CLI`, async () => {
                const { stderr, stdout } = await exec(`${cliCommand} \\
                    distribute \\
                    --file "tests/tests_artifacts/release.zip" \\
                    --slug "${appSlug}" \\
                    --api-key "${appApiKey}" \\
                    --version-code 1 \\
                    --version-name 1.0.0`)
                expect(stderr).toBeFalsy()
                expect(stdout).toContain('Finished Distributing')
            })
        }

        if (osTestType === 'Android') {
            await test.step('User can upload aab in website', async () => {
                await page.getByTestId('a_menus').getByText(orgName).click()
                await page.getByText(appName).click()
                await page.getByTestId('d_upload').click()
                await expect(page.getByTestId('upload_input_btn')).toBeVisible()
                const fileChooserPromise = page.waitForEvent('filechooser')
                await page.getByTestId('upload_input_btn').click()
                const fileChooser = await fileChooserPromise
                await fileChooser.setFiles('tests/tests_artifacts/app-release.aab')

                const generateBundleRespPromise = page.waitForResponse(r => r.url().includes('generate-bundle-headless'))
                const gbRespPromise = page.waitForResponse(r => r.url().includes('/genbndl'))
                const uploadArtifactUrlPromise = page.waitForResponse(r => r.url().includes('upload-artifact-url'))
                await page.getByTestId('submit_upload_btn').click()
                const generateBundleResp = await generateBundleRespPromise
                const uploadArtifactUrl = await uploadArtifactUrlPromise
                const gbResp = await gbRespPromise
                expect(generateBundleResp.status()).toBe(302)
                expect(gbResp.ok()).toBe(true)
                expect(uploadArtifactUrl.ok()).toBe(true)
                await expect(page.getByTestId('submit_upload_btn'), {
                    message: 'Dialog should be gone after upload success',
                }).not.toBeVisible()
            })
            await test.step('User can upload apk in website', async () => {
                await page.getByTestId('a_menus').getByText(orgName).click()
                await page.getByText(appName).click()
                await page.getByTestId('d_upload').click()
                await expect(page.getByTestId('upload_input_btn')).toBeVisible()
                const fileChooserPromise = page.waitForEvent('filechooser')
                await page.getByTestId('upload_input_btn').click()
                const fileChooser = await fileChooserPromise
                await fileChooser.setFiles('tests/tests_artifacts/app-arm64-v8a-release.apk')

                const uploadArtifactUrlPromise = page.waitForResponse(r => r.url().includes('upload-artifact-url'))
                await page.getByTestId('submit_upload_btn').click()
                const uploadArtifactUrl = await uploadArtifactUrlPromise
                expect(uploadArtifactUrl.ok()).toBe(true)
                await expect(page.getByTestId('submit_upload_btn')).not.toBeVisible()
            })
        } else if (osTestType === 'iOS') {
            await test.step('User can upload iOS ipa in website', async () => {
                await page.getByTestId('a_menus').getByText(orgName).click()
                await page.getByText(appName).click()
                await page.getByTestId('d_upload').click()
                await expect(page.getByTestId('upload_input_btn')).toBeVisible()
                const fileChooserPromise = page.waitForEvent('filechooser')
                await page.getByTestId('upload_input_btn').click()
                const fileChooser = await fileChooserPromise
                await fileChooser.setFiles('tests/tests_artifacts/testapp.ipa')

                const uploadArtifactUrlPromise = page.waitForResponse(r => r.url().includes('upload-artifact-url'))
                await page.getByTestId('submit_upload_btn').click()
                const uploadArtifactUrl = await uploadArtifactUrlPromise
                expect(uploadArtifactUrl.ok()).toBe(true)
                await expect(page.getByTestId('submit_upload_btn')).not.toBeVisible()
            })
        } else if (osTestType === 'Windows' || osTestType === 'MacOS' || osTestType === 'Linux') {
            await test.step(`User can upload ${osTestType} zip in website`, async () => {
                await page.getByTestId('a_menus').getByText(orgName).click()
                await page.getByText(appName).click()
                await page.getByTestId('d_upload').click()
                await expect(page.getByTestId('upload_input_btn')).toBeVisible()
                const fileChooserPromise = page.waitForEvent('filechooser')
                await page.getByTestId('upload_input_btn').click()
                const fileChooser = await fileChooserPromise
                await fileChooser.setFiles('tests/tests_artifacts/release.zip')
                
                // Fill in the version
                await page.getByTestId('i_versionname').fill('1.0.0')
                await page.getByTestId('i_versioncode').fill('1')

                const uploadArtifactUrlPromise = page.waitForResponse(r => r.url().includes('upload-artifact-url'))
                await page.getByTestId('submit_upload_btn').click()
                const uploadArtifactUrl = await uploadArtifactUrlPromise
                expect(uploadArtifactUrl.ok()).toBe(true)
                await expect(page.getByTestId('submit_upload_btn')).not.toBeVisible()
            })
        }
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
