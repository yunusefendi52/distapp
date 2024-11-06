import { findApiKey } from "./upload-artifact.post"

export default defineEventHandler(async (event) => {
    const { fileKey, appName, orgName, releaseNotes, packageMetadata, } = await readValidatedBody(event, z.object({
        fileKey: z.string().max(128),
        appName: z.string().trim().min(1).max(128),
        orgName: z.string().trim().min(1).max(128),
        releaseNotes: z.string().nullish(),
        packageMetadata: z.any(),
    }).parse)
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
        const { appsId } = await findApiKey(db, apiKeyPayload.id, orgName, appName)
        appId = appsId!
    } else {
        if (await roleEditNotAllowed(event, orgName)) {
            throw createError({
                message: 'Unauthorized',
                statusCode: 401,
            })
        }

        const { userApp } = await getUserApp(event, orgName, appName)
        appId = userApp.id
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

    return {
        artifactId: artifactsId,
    }
})
