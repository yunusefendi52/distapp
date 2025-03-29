import { eq, inArray } from "drizzle-orm"
import type { ApiKeyTypePayload } from "./api-keys/generate-api-key.post"
import { findApiKey } from "./artifacts/upload-artifact.post"

export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const request = await readBody<UpdateGroupsRequest>(event)

    let appId: string
    let orgId: string

    const apiKey = getHeader(event, 'API-KEY')
    if (apiKey) {
        const { app: { apiAuthKey } } = useRuntimeConfig(event)
        if (!apiAuthKey) {
            throw createError({
                message: 'Please provide using env NUXT_APP_API_AUTH_KEY',
                statusCode: 500,
            })
        }

        const apiKeyPayload: ApiKeyTypePayload = await verifyToken(event, apiKey, apiAuthKey)
        const { appsId, organizationId } = await findApiKey(db, apiKeyPayload.id, request.orgName, request.appName)
        appId = appsId!
        orgId = organizationId!
    } else {
        if (await roleEditNotAllowed(event, request.orgName)) {
            throw createError({
                message: 'Unauthorized',
                statusCode: 401,
            })
        }

        const { userApp, userOrg } = await getUserApp(event, request.orgName, request.appName)
        appId = userApp.id
        orgId = userOrg.org!.id
    }

    const groupIds = await db.select({
        id: tables.artifactsGroups.id,
    }).from(tables.artifactsGroups)
        .where(and(
            inArray(tables.artifactsGroups.name, request.groupNames),
            eq(tables.artifactsGroups.appsId, appId),
        ))
        .then(v => v.flatMap(v => v.id))

    if (!groupIds) {
        throw createError({
            message: 'Invalid groups ids',
        })
    }

    await db.transaction(async tx => {
        await tx.delete(tables.artifactsGroupsManager).where(eq(tables.artifactsGroupsManager.artifactsId, request.artifactId))
        if (groupIds && groupIds.length) {
            await tx.insert(tables.artifactsGroupsManager).values(groupIds.map(e => ({
                artifactsId: request.artifactId,
                artifactsGroupsId: e,
            })))
        }
    })

    return {
        ok: true,
    }
})

export interface UpdateGroupsRequest {
    artifactId: string,
    orgName: string,
    appName: string,
    groupNames: string[],
}
