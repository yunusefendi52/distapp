import { S3Fetch } from "~/server/services/s3fetch"
import { generateBundleHandler } from "./generateBundleHandler"
import promises from "node:fs/promises";
import { join } from "node:path";
import * as jose from 'jose'

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

    const { BUNDLEAAB: { KEYSTORE_URL, KEYSTORE_PASS, KEYSTORE_ALIAS } } = useRuntimeConfig(event)

    const isRunningServerless = import.meta.dev || navigator.userAgent === 'Cloudflare-Workers'
    if (isRunningServerless) {
        const origin = event.headers.get('origin')
        var keystoreUrl = KEYSTORE_URL
        if (keystoreUrl.startsWith('/')) {
            keystoreUrl = `${origin}${keystoreUrl}`
        }
        const pKey = `-----BEGIN PRIVATE KEY-----
${process.env.STANDBY_SERVER_PRIVATE_KEY}
-----END PRIVATE KEY-----`
        const algorithm = 'EdDSA'
        const privateKey = await jose.importPKCS8(pKey, algorithm)
        const requestData = await new jose.SignJWT({
            signedUrl: signedUrl,
            orgId: userApp.organizationsId!,
            appId: userApp.id,
            keystorePass: KEYSTORE_PASS,
            keystoreAlias: KEYSTORE_ALIAS,
            keystoreUrl: keystoreUrl,
            apkSignedUrl: request.apkUrl.apkSignedUrl,
        })
            .setProtectedHeader({
                alg: algorithm,
            })
            .setIssuedAt()
            .setExpirationTime('5m')
            .sign(privateKey)
        const verifierUrl = `${origin}/.known-jks/svc.pub`
        const redirectUrl = new URLSearchParams({
            verifierUrl,
            r: requestData,
        })
        await sendRedirect(event, `${process.env.STANDBY_SERVER_URL}/gb?${redirectUrl}`, 303)
    } else {
        await generateBundleHandler(
            signedUrl,
            userApp.organizationsId!,
            userApp.id,
            KEYSTORE_PASS,
            KEYSTORE_ALIAS,
            KEYSTORE_URL,
            request.apkUrl.apkSignedUrl,
            async (keystoreFile) => {
                await promises.copyFile(join('public', KEYSTORE_URL), keystoreFile)
            })
    }
})
