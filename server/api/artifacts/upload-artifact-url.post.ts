import { findApiKey } from "./upload-artifact.post"

export default defineEventHandler(async (event) => {
    const { uploadId, fileKey, apkFileKey, appName, orgName, releaseNotes, packageMetadata, filename, headlessUploadId } = await readValidatedBody(event, z.object({
        uploadId: z.string().max(128),
        fileKey: z.string().max(128),
        apkFileKey: z.string().max(128).nullish(),
        appName: z.string().trim().min(1).max(128),
        orgName: z.string().trim().min(1).max(128),
        releaseNotes: z.string().nullish(),
        packageMetadata: z.any(),
        filename: z.string().regex(filenameRegex, `Filename must have regex ${filenameRegex.source}`),
        headlessUploadId: z.string().nullish(),
    }).parse)
    var appId: string
    var orgId: string

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
        const { appsId, organizationId } = await findApiKey(db, apiKeyPayload.id, orgName, appName)
        appId = appsId!
        orgId = organizationId!
    } else {
        if (await roleEditNotAllowed(event, orgName)) {
            throw createError({
                message: 'Unauthorized',
                statusCode: 401,
            })
        }

        const { userApp, userOrg } = await getUserApp(event, orgName, appName)
        appId = userApp.id
        orgId = userOrg.org!.id
    }

    const packageData = packageMetadata as {
        versionCode: string,
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
    await db.batch([
        db.delete(tables.keyValue)
            .where(or(
                eq(tables.keyValue.key, uploadId),
                ...(headlessUploadId ? [eq(tables.keyValue.key, headlessUploadId!)] : []),
            )),
        db.insert(tables.artifacts).values({
            id: artifactsId,
            createdAt: now,
            updatedAt: now,
            fileObjectKey: fileKey,
            fileObjectApkKey: apkFileKey,
            versionCode2: packageData?.versionCode?.toString()!,
            versionName2: packageData?.versionName!,
            appsId: appId,
            organizationId: orgId,
            releaseNotes: releaseNotes,
            releaseId: newReleaseId,
            extension: packageData?.extension,
            packageName: packageData?.packageName,
            filename: filename.substring(0, 32),
        }),
    ])

    return {
        artifactId: artifactsId,
    }
})
