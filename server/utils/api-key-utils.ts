import type { EventHandlerRequest, H3Event } from "h3"
import type { ApiKeyTypePayload } from "~/server/api/api-keys/generate-api-key.post"
import { findApiKey } from "~/server/api/artifacts/upload-artifact.post"

export async function getAuthApiKey(
    event: H3Event<EventHandlerRequest>,
    orgName: string,
    appName: string) {
    const apiKey = getHeader(event, 'API-KEY')
    const db = event.context.drizzle
    if (apiKey) {
        const { appConfig: { apiAuthKey } } = useRuntimeConfig(event)
        if (!apiAuthKey) {
            throw createError({
                message: 'Please provide using env NUXT_APP_CONFIG_API_AUTH_KEY',
                statusCode: 500,
            })
        }

        const apiKeyPayload: ApiKeyTypePayload = await verifyToken(event, apiKey, apiAuthKey)
        const { organizationId, appsId, id: apiKeyId } = await findApiKey(db, apiKeyPayload.id, orgName, appName)
        return {
            orgId: organizationId!,
            appId: appsId!,
            apiKeyId,
        }
    } else {
        return undefined
    }
}