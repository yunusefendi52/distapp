import { count, sum } from "drizzle-orm"
import type { LibSQLDatabase } from "drizzle-orm/libsql"
import { uuidv7 } from "uuidv7"

export type UploadTempValue = {
    fileKey: string
    orgId: string
    appId: string
    fileSize?: number | undefined
    fileApkSize?: number | null | undefined
    apkFileKey?: string | undefined
}

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
    const { orgName, appName, hasFileApk, filename, fileSize, fileSizeApk } = await readValidatedBody(event, z.object({
        appName: z.string().trim().min(1).max(128),
        orgName: z.string().trim().min(1).max(128),
        hasFileApk: z.boolean().default(false),
        filename: z.string().regex(filenameRegex, `Filename must have regex ${filenameRegex.source}`),
        fileSize: z.number(),
        fileSizeApk: z.number().nullish(),
    }).parse)

    var orgId: string
    var appId: string
    var createdBy: string
    const apiKey = await getAuthApiKey(event, orgName, appName)
    if (apiKey) {
        orgId = apiKey.orgId
        appId = apiKey.appId
        createdBy = `api-key-${apiKey.apiKeyId}`
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

    const { uploadLimitSize, artifactSizeLimit } = await getUserFeature(event, orgId)
    if (fileSize >= uploadLimitSize || (hasFileApk && fileSizeApk ? fileSizeApk >= uploadLimitSize : false)) {
        throw createError({
            message: `Maximum file size is ${uploadLimitSize} bytes`,
        })
    }

    const { artifactSize } = await getArtifactSizeByOrg(event, orgId)
    const artifactSizeBytesLimit = artifactSizeLimit * 1024 * 1024
    const sumAllContentLength = artifactSize + fileSize + (fileSizeApk || 0)
    if (sumAllContentLength >= artifactSizeBytesLimit) {
        throw createError({
            message: `The number of artifact has reached the limit of ${artifactSizeLimit} mb. ${sumAllContentLength}`,
            statusCode: 400,
        })
    }

    // Always limit file size when user upload directly
    const { fileKey, signedUrl } = await generateSignedUrlUpload(orgId, appId, fileSize)
    const apkUrl = hasFileApk && fileSizeApk ? await generateSignedUrlUpload(orgId, appId, fileSizeApk) : undefined
    const uploadId = uuidv7()
    const now = new Date()
    await db.insert(tables.keyValue)
        .values({
            key: uploadId,
            value: {
                fileKey,
                orgId: orgId,
                appId: appId,
                fileSize: fileSize,
                fileApkSize: fileSizeApk,
                ...(apkUrl ? {
                    apkFileKey: apkUrl?.fileKey
                } : undefined),
            } satisfies UploadTempValue,
            group: 'upload_temp',
            createdAt: now,
            updatedAt: now,
        })
    return {
        uploadId,
        fileKey,
        url: signedUrl,
        apkUrl: apkUrl ? {
            apkSignedUrl: apkUrl.signedUrl,
            apkFileKey: apkUrl.fileKey,
        } : undefined,
    } satisfies UploadArtifactResponse
})
