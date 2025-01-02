import { extractAabToApk } from "~/cli/extract-aab-to-apk"
import { S3Fetch } from "~/server/services/s3fetch"
import { existsSync, promises, createReadStream } from 'fs'
import { join } from "path"
import { downloadFile } from "~/server/services/downloadFile"
import { uuidv4 } from "uuidv7"

async function generateTempFolder(orgId: string, appId: string): Promise<string> {
    const tempFolder = join(process.cwd(), '.temp', 'aab_gen', orgId, appId, uuidv4().substring(0, 13))
    await promises.mkdir(tempFolder, {
        recursive: true,
    })
    return tempFolder
}

export default defineEventHandler(async event => {
    setHeader(event, 'connection', 'keep-alive')
    setHeader(event, 'content-type', 'text/plain')

    const request = await readValidatedBody(event, z.object({
        orgName: z.string().min(1).max(128),
        appName: z.string().min(1).max(128),
        fileKey: z.string().min(1),
        apkUrl: z.object({
            apkSignedUrl: z.string().min(1),
            apkFileKey: z.string().min(1),
        }),
    }).parseAsync)

    const { userApp } = await getUserApp(event, request.orgName, request.appName)

    const s3 = new S3Fetch()
    const { assets } = getStorageKeys(userApp.organizationsId!, userApp.id, request.fileKey)
    const signedUrl = await s3.getSignedUrlGetObject(assets, 300, `attachment; filename="app.aab"`)

    const aabGenFolderTemp = await generateTempFolder(userApp.organizationsId!, userApp.id)
    const aabFilePath = join(aabGenFolderTemp, 'app.aab')

    try {
        await downloadFile(signedUrl, aabFilePath)

        const { bundleApk, dispose } = await extractAabToApk(aabFilePath, async (keystoreFile) => {
            const { BUNDLEAAB: { KEYSTORE_URL, KEYSTORE_PASS, KEYSTORE_ALIAS } } = useRuntimeConfig(event)

            await promises.copyFile(join('public', KEYSTORE_URL), keystoreFile)

            if (!existsSync(keystoreFile)) {
                throw 'keystoreFile not found, should not happen'
            }

            return {
                appKeystorePass: KEYSTORE_PASS,
                appKeystoreAlias: KEYSTORE_ALIAS,
                appKeystoreUrl: KEYSTORE_URL,
            }
        })

        try {
            const bundleApkFile = await promises.readFile(bundleApk)
            await $fetch.raw(request.apkUrl.apkSignedUrl, {
                method: 'put',
                body: bundleApkFile,
                redirect: 'follow',
            })
        } finally {
            dispose()
        }
    } finally {
        await promises.rm(aabGenFolderTemp, {
            force: true,
            recursive: true,
        })
    }
})
