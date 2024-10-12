import { count, type SQL } from "drizzle-orm"
import { findApiKey } from "./upload-artifact.post"

export default defineEventHandler(async (event) => {
    const { uploadId, appName, orgName, releaseNotes, packageMetadata, } = await readValidatedBody(event, z.object({
        uploadId: z.string().max(128),
        appName: z.string().trim().min(1).max(128),
        orgName: z.string().trim().min(1).max(128),
        releaseNotes: z.string().nullish(),
        packageMetadata: z.any(),
    }).parse)
    var uploadTempWhere: SQL<unknown>
    var fileKey: string
    var appId: string

    const apiKey = getHeader(event, 'API-KEY')
    const db = event.context.drizzle
    if (apiKey) {
        const { app: { apiAuthKey } } = useRuntimeConfig(event)
        if (!apiAuthKey) {
            throw createError({
                message: 'Please provide using env NUXT_APP_API_AUTH_KEY',
                statusCode: 500,
            })
        }

        const apiKeyPayload = await verifyToken(event, apiKey, apiAuthKey)
        uploadTempWhere = and(
            eq(tables.uploadTemp.id, uploadId),
            eq(tables.uploadTemp.createdBy, `api-key-${apiKeyPayload.id}`),
        )!
        const uploadTempData = await db.select()
            .from(tables.uploadTemp)
            .where(uploadTempWhere)
            .then(takeUniqueOrThrow)
        const { appsId } = await findApiKey(db, apiKeyPayload.id, orgName, appName)
        appId = appsId!
        fileKey = uploadTempData.fileKey
    } else {
        if (await roleEditNotAllowed(event, orgName)) {
            throw createError({
                message: 'Unauthorized',
                statusCode: 401,
            })
        }

        const userId = event.context.auth.userId

        uploadTempWhere = and(
            eq(tables.uploadTemp.id, uploadId),
            eq(tables.uploadTemp.createdBy, userId),
        )!
        const uploadTempData = await db.select()
            .from(tables.uploadTemp)
            .where(uploadTempWhere)
            .then(takeUniqueOrThrow)

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

        fileKey = uploadTempData.fileKey
        appId = app.id
    }

    const packageData = packageMetadata as {
        versionCode: number,
        versionName: string,
        packageName: string,
        extension: string,
    }
    if (!packageData) {
        setResponseStatus(event, 400, 'Cannot read package')
        return
    }

    // Inserting to db
    const lastArtifact = await db.query.artifacts.findFirst({
        orderBy(fields, operators) {
            return operators.desc(fields.releaseId)
        },
        where(fields, operators) {
            return operators.eq(fields.appsId, appId)
        },
    })
    const newReleaseId = (lastArtifact?.releaseId ?? 0) + 1
    const now = new Date()
    const artifactsId = generateId()
    await db.transaction(async () => {
        await db.delete(tables.uploadTemp)
            .where(uploadTempWhere)
        await db.insert(tables.artifacts).values({
            id: artifactsId,
            createdAt: now,
            updatedAt: now,
            fileObjectKey: fileKey,
            versionCode2: packageData?.versionCode?.toString()!,
            versionName2: packageData?.versionName!,
            appsId: appId,
            releaseNotes: releaseNotes,
            releaseId: newReleaseId,
            extension: packageData?.extension,
            packageName: packageData?.packageName,
        })
    })

    return {
        artifactId: artifactsId,
    }
})
