import type { EventHandlerRequest, H3Event, H3EventContext } from "h3"

export const getArtifactFromPublicId = async (event: H3Event<EventHandlerRequest>, publicId: string) => {
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
    return {
        app,
        org,
        artifactGroup,
    }
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const publicId = query.publicId?.toString()
    if (!publicId) {
        setResponseStatus(event, 401)
        return
    }

    const db = event.context.drizzle
    const { app, artifactGroup, org } = await getArtifactFromPublicId(event, publicId)
    const artifactList = await db.select()
        .from(tables.artifactsGroupsManager)
        .leftJoin(tables.artifacts, eq(tables.artifacts.id, tables.artifactsGroupsManager.artifactsId))
        .where(eq(tables.artifactsGroupsManager.artifactsGroupsId, artifactGroup.id))
        .orderBy(desc(tables.artifacts.createdAt))
        .limit(100)
    return {
        app,
        org,
        artifactGroup,
        artifacts: artifactList,
    }
})
