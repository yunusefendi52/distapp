import { count } from "drizzle-orm"
import type { LibSQLDatabase } from "drizzle-orm/libsql"

export async function findApiKey(
    db: LibSQLDatabase<typeof tables>,
    apiKeyId: string,
    orgName: string,
    appName: string) {
    const keys = await db.select({
        id: tables.apiKeys.id,
        organizationId: tables.apiKeys.organizationId,
        appsId: tables.apiKeys.appsId,
        appName: tables.apps.name,
        orgName: tables.organizations.name,
    })
        .from(tables.apiKeys)
        .leftJoin(tables.apps, eq(tables.apps.id, tables.apiKeys.appsId))
        .leftJoin(tables.organizations, eq(tables.organizations.id, tables.apiKeys.organizationId))
        .where(and(
            eq(tables.apiKeys.id, apiKeyId),
            eq(tables.organizations.name, orgName),
            eq(tables.apps.name, appName),
        ))
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
            message: 'Invalid api key auth or slug not found',
            statusCode: 400,
        })
    }
    return keys[0]
}

export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const { orgName, appName } = await readValidatedBody(event, z.object({
        appName: z.string().trim().min(1).max(128),
        orgName: z.string().trim().min(1).max(128),
    }).parse)

    var orgId: string
    var appId: string
    var createdBy: string
    const apiKey = getHeader(event, 'API-KEY')
    if (apiKey) {
        const { app: { apiAuthKey } } = useRuntimeConfig(event)
        if (!apiAuthKey) {
            throw createError({
                message: 'Please provide using env NUXT_APP_API_AUTH_KEY',
                statusCode: 500,
            })
        }

        const apiKeyPayload = await verifyToken(event, apiKey, apiAuthKey)
        const { organizationId, appsId, id: apiKeyId } = await findApiKey(db, apiKeyPayload.id, orgName, appName)
        orgId = organizationId!
        appId = appsId!
        createdBy = `api-key-${apiKeyId}`
    } else {
        if (await roleEditNotAllowed(event, orgName)) {
            throw createError({
                message: 'Unauthorized',
                statusCode: 401,
            })
        }
        const userId = event.context.auth.userId
        const userOrg = await db.select({
            organizationsId: tables.organizations.id,
        })
            .from(tables.organizationsPeople)
            .leftJoin(tables.organizations, eq(tables.organizations.id, tables.organizationsPeople.organizationId))
            .where(and(eq(tables.organizationsPeople.userId, userId), eq(tables.organizations.name, orgName!.toString())))
            .then(takeUniqueOrThrow)
        const app = await db.query.apps.findMany({
            where(fields, operators) {
                return operators.and(operators.eq(fields.organizationsId, userOrg.organizationsId!), operators.eq(fields.name, appName!.toString()))
            },
        }).then(takeUniqueOrThrow)
        orgId = userOrg!.organizationsId!
        appId = app.id
        createdBy = userId
    }

    const artifactTotal = await db.select({
        count: count(tables.artifacts),
    }).from(tables.artifacts)
        .where(eq(tables.artifacts.appsId, appId))
        .then(takeUniqueOrThrow)
    if (artifactTotal.count >= 10) {
        throw createError({
            message: 'Currently it\'s limited up to 10, we still tidying up, for now you can remove one of the previous artifact',
            statusCode: 400,
        })
    }

    const { uploadId, fileKey, signedUrl } = await generateSignedUrlUpload(event, orgId, appId)
    await db.insert(tables.uploadTemp)
        .values({
            id: uploadId,
            fileKey: fileKey,
            createdAt: new Date(),
            createdBy: createdBy,
        })
    return {
        uploadId,
        url: signedUrl,
    }
})
