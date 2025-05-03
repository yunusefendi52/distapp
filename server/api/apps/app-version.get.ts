export default defineEventHandler(async event => {
    const { orgId, appId, group } = await getValidatedQuery(event, z.object({
        orgId: z.string().min(1).max(256),
        appId: z.string().min(1).max(256),
        group: z.string().nullish(),
    }).parse)
    const db = event.context.drizzle
    const app = await db.select({
        name: tables.apps.name,
        displayName: tables.apps.displayName,
        orgName: tables.organizations.name,
        orgDisplayName: tables.organizations.displayName,
        osType: tables.apps.osType,
    }).from(tables.apps)
        .leftJoin(tables.organizations, eq(tables.organizations.id, tables.apps.organizationsId))
        .where(and(
            eq(tables.apps.organizationsId, orgId),
            eq(tables.apps.id, appId),
        )).then(takeUniqueOrThrow)
    const artifact = await db.select({
        groupName: tables.artifactsGroups.displayName,
        artifactId: tables.artifacts.id,
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
    const installParam = new URLSearchParams({
        artifactId: `${artifact?.artifactId || ''}`,
    })
    const installLink = `/install/${app.orgName}/apps/${app.name}/${group || ''}${artifact ? `?${installParam.toString()}`: ''}`
    return {
        appName: app.displayName,
        orgName: app.orgDisplayName,
        groupName: group ? artifact?.groupName : undefined,
        releaseId: artifact?.releaseId,
        platform: app.osType,
        versionCode: artifact?.versionCode,
        versionName: artifact?.versionName,
        releaseNotes: artifact?.releaseNotes || undefined,
        installLink: group ? installLink : undefined,
    }
})