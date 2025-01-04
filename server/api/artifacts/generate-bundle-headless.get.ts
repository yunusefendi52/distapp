import { S3Fetch } from "~/server/services/s3fetch"
import { generateBundleHandler } from "./generateBundleHandler"
import promises from "node:fs/promises";
import { join } from "node:path";
import * as jose from 'jose'

export default defineEventHandler(async event => {
    setHeader(event, 'connection', 'keep-alive')
    setHeader(event, 'content-type', 'text/plain')

    const request = await getValidatedQuery(event, z.object({
        orgName: z.string().min(1).max(128),
        appName: z.string().min(1).max(128),
        fileKey: z.string().min(1),
        apkSignedUrl: z.string().min(1),
        apkFileKey: z.string().min(1),
        hostOrigin: z.string().nullish()
    }).parseAsync)

    const { userApp } = await getUserApp(event, request.orgName, request.appName)

    const s3 = new S3Fetch()
    const { assets } = getStorageKeys(userApp.organizationsId!, userApp.id, request.fileKey)
    const signedUrl = await s3.getSignedUrlGetObject(assets, 300, `attachment; filename="app.aab"`)

    const { BUNDLEAAB: { KEYSTORE_URL, KEYSTORE_PASS, KEYSTORE_ALIAS } } = useRuntimeConfig(event)

    // Need a better way to test this, currently only test without headless mode
    const isRunningServerless = (typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers')
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
            apkSignedUrl: request.apkSignedUrl,
        })
            .setProtectedHeader({
                alg: algorithm,
            })
            .setExpirationTime('5m')
            .sign(privateKey)
        const verifierUrl = `${origin}/.known-jks/svc${process.env.IS_RUNNING_TEST === '1' ? '-test' : ''}.pub`
        const verifierKey = await $fetch<string>(verifierUrl)
        const redirectUrl = new URLSearchParams({
            verifierKey: verifierKey,
            r: requestData,
        })
        await sendRedirect(event, `${process.env.STANDBY_SERVER_URL}/genbndl?${redirectUrl}`, 302)
    } else {
        await generateBundleHandler(
            signedUrl,
            userApp.organizationsId!,
            userApp.id,
            KEYSTORE_PASS,
            KEYSTORE_ALIAS,
            KEYSTORE_URL,
            request.apkSignedUrl,
            async (keystoreFile) => {
                await promises.copyFile(join('public', KEYSTORE_URL), keystoreFile)
            })
        // For compatibility to test
        await sendRedirect(event, `/genbndl`, 302)
    }
})
