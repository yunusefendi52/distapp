import { and, desc, eq } from "drizzle-orm"
import { artifacts, artifactsGroupsManager, organizations, organizationsPeople } from "~/server/db/schema"
import { takeUniqueOrThrow } from "../detail-app.get"

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const publicId = query.publicId?.toString()
    if (!publicId) {
        setResponseStatus(event, 401)
        return
    }

    const db = event.context.drizzle
    const artifactGroup = await db.query.artifactsGroups.findMany({
        where(fields, operators) {
            return operators.eq(fields.publicId, publicId)
        },
    }).then(takeUniqueOrThrow)
    const app = await db.query.apps.findMany({
        where(fields, operators) {
            return operators.eq(fields.id, artifactGroup.appsId!)
        },
    }).then(takeUniqueOrThrow)
    const org = await db.query.organizations.findMany({
        where(fields, operators) {
            return operators.eq(fields.id, app.organizationsId!)
        },
    }).then(takeUniqueOrThrow)
    const artifactList = await db.select()
        .from(artifactsGroupsManager)
        .leftJoin(artifacts, eq(artifacts.id, artifactsGroupsManager.artifactsId))
        .where(eq(artifactsGroupsManager.artifactsGroupsId, artifactGroup.id))
        .orderBy(desc(artifacts.createdAt))
        .limit(100)
    return {
        app,
        org,
        artifactGroup,
        artifacts: artifactList,
    }
})
