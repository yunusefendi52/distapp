export default defineEventHandler(async event => {
    const { orgId, appId, group } = await getValidatedQuery(event, z.object({
        orgId: z.string().min(1).max(256),
        appId: z.string().min(1).max(256),
        group: z.string().nullish(),
    }).parse)
    const db = event.context.drizzle
    const app = await db.select({
        displayName: tables.apps.displayName,
        osType: tables.apps.osType,
    }).from(tables.apps)
        .where(and(
            eq(tables.apps.organizationsId, orgId),
            eq(tables.apps.id, appId),
        )).then(takeUniqueOrThrow)
    const artifact = await db.select({
        groupName: tables.artifactsGroups.displayName,
        releaseId: tables.artifacts.releaseId,
        versionCode: tables.artifacts.versionCode2,
        versionName: tables.artifacts.versionName2,
        releaseNotes: tables.artifacts.releaseNotes,
    })
        .from(tables.artifacts)
        .leftJoin(tables.artifactsGroupsManager, eq(tables.artifactsGroupsManager.artifactsId, tables.artifacts.id))
        .leftJoin(tables.artifactsGroups, eq(tables.artifactsGroups.id, tables.artifactsGroupsManager.artifactsGroupsId))
        .where(and(
            eq(tables.artifacts.appsId, appId),
            eq(tables.artifacts.organizationId, orgId),
            ...(group ? [eq(tables.artifactsGroups.name, group)] : []),
        ))
        .orderBy(desc(tables.artifacts.createdAt))
        .limit(1)
        .then(singleOrDefault)

    return {
        name: app.displayName,
        groupName: group ? artifact?.groupName : undefined,
        releaseId: artifact?.releaseId,
        platform: app.osType,
        versionCode: artifact?.versionCode,
        versionName: artifact?.versionName,
        releaseNotes: artifact?.releaseNotes || undefined,
    }
})