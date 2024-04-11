import { and, eq } from "drizzle-orm"
import { artifacts, organizations, organizationsPeople } from "~/server/db/schema"
import { getStorageKeys } from "~/server/utils/utils"
import { takeUniqueOrThrow } from "../detail-app.get"
import { createS3 } from "~/server/services/s3"

export default defineEventHandler(async (event) => {
    const { key, appName, orgName, releaseNotes } = await readBody(event)
    const { temp, assets } = getStorageKeys(event.context.auth, key)
    const userId = event.context.auth.userId
    const db = event.context.drizzle
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
    await db.insert(artifacts).values({
        id: artifactsId,
        createdAt: now,
        updatedAt: now,
        fileObjectKey: key,
        versionCode2: '1',
        versionName2: '1.0.0',
        appsId: app.id,
        releaseNotes: releaseNotes,
        releaseId: newReleaseId,
    })
    const s3 = createS3(event)
    await s3.copyObject({
        CopySource: `app-deployin/${temp}`,
        Bucket: 'app-deployin',
        Key: assets,
    })
    await s3.deleteObject({
        Bucket: 'app-deployin',
        Key: temp,
    })
})
