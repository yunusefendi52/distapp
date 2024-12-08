export type BundleKeystoreResponse = {
    appKeystorePass: string
    appKeystoreAlias: string
    appKeystoreBase64: string
}

export default defineEventHandler(async (event) => {
    const { BUNDLEAAB: { KEYSTORE_BASE64, KEYSTORE_PASS, KEYSTORE_ALIAS } } = useRuntimeConfig(event)
    const apiKey = getHeader(event, 'API-KEY')
    if (apiKey) {
        const { app: { apiAuthKey } } = useRuntimeConfig(event)
        if (!apiAuthKey) {
            throw createError({
                message: 'Please provide using env NUXT_APP_API_AUTH_KEY to get key',
                statusCode: 500,
            })
        }
        await verifyToken(event, apiKey, apiAuthKey)
    } else if (!event.context.auth) {
        throw createError({
            message: 'Invalid get auth key',
        })
    }

    // setHeader(event, 'Cache-Control', 'max-age=86400, private')
    return {
        appKeystorePass: KEYSTORE_PASS,
        appKeystoreAlias: KEYSTORE_ALIAS,
        appKeystoreBase64: KEYSTORE_BASE64,
    } satisfies BundleKeystoreResponse
})
