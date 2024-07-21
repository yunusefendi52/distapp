import { and, eq } from "drizzle-orm"
import { artifacts, organizations, organizationsPeople, uploadTemp } from "~/server/db/schema"

export default defineEventHandler(async (event) => {
    const { uploadId: uploadIdAny, appName, orgName, releaseNotes, packageMetadata, } = await readBody(event)
    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }
    const db = event.context.drizzle

    const uploadId = uploadIdAny as string
    const userId = event.context.auth.userId

    const uploadTempWhere = and(
        eq(uploadTemp.id, uploadId),
        eq(uploadTemp.userId, userId),
    )
    const uploadTempData = await db.select()
        .from(uploadTemp)
        .where(uploadTempWhere)
        .then(takeUniqueOrThrow)

    const userOrg = await db.select({
        organizationsId: organizations.id,
    })
        .from(organizationsPeople)
        .leftJoin(organizations, eq(organizations.id, organizationsPeople.organizationId))
        .where(and(eq(organizationsPeople.userId, userId), eq(organizations.name, orgName!.toString())))
        .then(takeUniqueOrThrow)
    const app = await db.query.apps.findMany({
        where(fields, operators) {
            return operators.and(operators.eq(fields.organizationsId, userOrg.organizationsId!), operators.eq(fields.name, appName!.toString()))
        },
    }).then(takeUniqueOrThrow)
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
            return operators.eq(fields.appsId, app.id)
        },
    })
    const newReleaseId = (lastArtifact?.releaseId ?? 0) + 1
    const now = new Date()
    const artifactsId = generateId()
    const fileKey = uploadTempData.fileKey
    await db.transaction(async () => {
        await db.delete(uploadTemp)
            .where(uploadTempWhere)
        await db.insert(artifacts).values({
            id: artifactsId,
            createdAt: now,
            updatedAt: now,
            fileObjectKey: fileKey,
            versionCode2: packageData?.versionCode?.toString()!,
            versionName2: packageData?.versionName!,
            appsId: app.id,
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
