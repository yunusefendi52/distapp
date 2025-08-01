export type BundleKeystoreResponse = {
    appKeystorePass: string
    appKeystoreAlias: string
    appKeystoreUrl: string
}

export default defineEventHandler(async (event) => {
    const { BUNDLEAAB: { KEYSTORE_URL, KEYSTORE_PASS, KEYSTORE_ALIAS } } = useRuntimeConfig(event)
    const apiKey = getHeader(event, 'API-KEY')
    if (apiKey) {
        const apiAuthKey = getApiAuthKey(event)
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
        appKeystoreUrl: KEYSTORE_URL,
    } satisfies BundleKeystoreResponse
})
