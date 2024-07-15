import { and, eq } from "drizzle-orm"
import { apiKeys, organizations, organizationsPeople } from "../../db/schema"

export default defineEventHandler(async (event) => {
    const { app: { apiAuthKey } } = useRuntimeConfig(event)
    if (!apiAuthKey) {
        throw createError({
            message: 'Please provide using env NUXT_APP_API_AUTH_KEY',
            statusCode: 500,
        })
    }

    const apiKeyToken = event.headers.get('API-KEY')
    if (!apiKeyToken) {
        throw createError({
            message: 'Missing api key',
            statusCode: 400,
        })
    }

    const apiKeyPayload = await verifyToken(event, apiKeyToken, apiAuthKey)

    const db = event.context.drizzle
    const keys = await db.select()
        .from(apiKeys)
        .where(eq(apiKeys.id, apiKeyPayload.id))
        .limit(2)
    if (keys.length > 1) {
        console.log('This shouldnt happen, check data integrity')
        throw createError({
            message: 'Invalid key',
            statusCode: 500,
        })
    }
    if (!keys.length) {
        throw createError({
            message: 'Invalid key auth',
            statusCode: 400,
        })
    }

    const { organizationId, appsId } = keys[0]

    const { token, signedUrl } = await generateSignedUrlUpload(event, organizationId!, appsId!)

    return {
        ok: true,
        token,
        signedUrl,
    }
})
