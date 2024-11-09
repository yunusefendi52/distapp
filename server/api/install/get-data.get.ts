export default defineEventHandler(async (event) => {
    const { orgName, appName, publicId } = await getValidatedQuery(event, z.object({
        orgName: z.string().min(1).max(128),
        appName: z.string().min(1).max(128),
        publicId: z.string().min(1).max(128),
    }).parse)
    if (!publicId) {
        setResponseStatus(event, 401)
        return
    }

    const db = event.context.drizzle
    const { app, artifactGroup, org } = await getArtifactGroupFromPublicIdOrUser(event, orgName, appName, publicId)
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
