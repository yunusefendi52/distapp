import { S3Fetch } from "~/server/services/s3fetch"
import promises from "node:fs/promises"
import { join } from "node:path"
import * as jose from 'jose'
import type { UploadTempValue } from "./upload-artifact.post"

export default defineEventHandler(async event => {
    setHeader(event, 'connection', 'keep-alive')
    setHeader(event, 'content-type', 'text/plain')

    const db = event.context.drizzle

    const request = await getValidatedQuery(event, z.object({
        orgName: z.string().min(1).max(128),
        appName: z.string().min(1).max(128),
        fileKey: z.string().min(1),
        hostOrigin: z.string().nullish()
    }).parseAsync)

    const { userApp } = await getUserApp(event, request.orgName, request.appName)
    const apkSignedUrl = await generateSignedUrlUpload(userApp.organizationsId!, userApp.id, 'allow_no_limit')

    const s3 = new S3Fetch()
    const { assets } = getStorageKeys(userApp.organizationsId!, userApp.id, request.fileKey)
    const signedUrl = await s3.getSignedUrlGetObject(assets, 300, `attachment; filename="app.aab"`)

    const { BUNDLEAAB: { KEYSTORE_URL, KEYSTORE_PASS, KEYSTORE_ALIAS } } = useRuntimeConfig(event)

    const uploadIdHeadless = generateId()
    const now = new Date()
    await db.insert(tables.keyValue)
        .values({
            key: uploadIdHeadless,
            value: {
                fileKey: apkSignedUrl.fileKey,
                orgId: userApp.organizationsId!,
                appId: userApp.id,
            } satisfies UploadTempValue,
            group: 'upload_temp_headless',
            createdAt: now,
            updatedAt: now,
        })

    // Need a better way to test this, currently only test without headless mode
    const isRunningServerless = process.env.STANDBY_SERVER_ENABLED === '1' || (typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers')
    if (isRunningServerless) {
        const origin = request.hostOrigin
        var keystoreUrl = KEYSTORE_URL
        if (keystoreUrl.startsWith('/')) {
            keystoreUrl = `${origin}${keystoreUrl}`
        }
        const pKey = `-----BEGIN PRIVATE KEY-----
${process.env.STANDBY_SERVER_PRIVATE_KEY}
-----END PRIVATE KEY-----`
        const algorithm = 'EdDSA'
        const privateKey = await jose.importPKCS8(pKey, algorithm)
        // Mind the URL limits
        const requestData = await new jose.SignJWT({
            signedUrl: signedUrl,
            orgId: userApp.organizationsId!,
            appId: userApp.id,
            keystorePass: KEYSTORE_PASS,
            keystoreAlias: KEYSTORE_ALIAS,
            keystoreUrl: keystoreUrl,
            apkSignedUrl: apkSignedUrl.signedUrl,
            apkFileKey: apkSignedUrl.fileKey,
            uploadIdHeadless,
        })
            .setProtectedHeader({
                alg: algorithm,
            })
            .setExpirationTime('5m')
            .sign(privateKey)
        const verifierUrl = `${origin}/.known-jks/svc${process.env.IS_RUNNING_TEST === '1' ? '-test' : ''}.pub`
        const verifierKey = await $fetch<string>(verifierUrl, {
            parseResponse(responseText) {
                return responseText
                    .replaceAll('-----BEGIN PUBLIC KEY-----', '')
                    .replaceAll('-----END PUBLIC KEY-----', '')
                    .trim()
            },
        })
        const redirectUrl = new URLSearchParams({
            verifierKey: verifierKey,
            r: requestData,
        })
        await sendRedirect(event, `${process.env.STANDBY_SERVER_URL}/genbndl?${redirectUrl}`, 302)
    } else {
        if (import.meta.preset !== 'cloudflare-pages') {
            const { generateBundleHandler } = await import('../../services/generateBundleHandler')
            await generateBundleHandler(
                signedUrl,
                userApp.organizationsId!,
                userApp.id,
                KEYSTORE_PASS,
                KEYSTORE_ALIAS,
                KEYSTORE_URL,
                apkSignedUrl.signedUrl,
                async (keystoreFile: string) => {
                    await promises.copyFile(join('public', KEYSTORE_URL), keystoreFile)
                })
            const params = new URLSearchParams({
                apkFileKey: apkSignedUrl.fileKey,
                uploadIdHeadless,
            })
            // For compatibility to test
            await sendRedirect(event, `/genbndl?${params}`, 302)
        } else {
            throw createError({
                statusCode: 400,
                message: 'No bundle handler',
            })
        }
    }
})
