export default defineEventHandler(async event => {
    const userId = event.context.auth.userId
    const db = event.context.drizzle
    const usages = await db.select({
        orgDisplayName: tables.organizations.displayName,
        orgId: tables.organizations.id,
        storageSize: sql<number>`sum(${tables.artifacts.fileContentLength}) + sum(coalesce(${tables.artifacts.fileApkContentLength}, 0))`,
        maxTotalSizeMb: sql<number>`0`,
    })
        .from(tables.artifacts)
        .rightJoin(tables.organizationsPeople, eq(tables.organizationsPeople.organizationId, tables.artifacts.organizationId))
        .rightJoin(tables.organizations, eq(tables.organizations.id, tables.organizationsPeople.organizationId))
        .rightJoin(tables.users, eq(tables.users.id, tables.organizationsPeople.userId))
        .groupBy(tables.organizations.name)
        .where(and(
            eq(tables.users.id, userId),
            eq(tables.organizationsPeople.role, 'owner'),
        ))

    const orgFeatures = await Promise.all(usages.map(async (u) => {
        const feature = await getUserFeature(event, u.orgId!)
        return {
            orgId: u.orgId!,
            feature,
        }
    }))

    usages.forEach(e => {
        e.maxTotalSizeMb = orgFeatures.find(e => e.orgId === e.orgId)?.feature.artifactSizeLimit || 0
    })

    return {
        totalStorage: usages.reduce((p, value) => value.storageSize + p, 0),
        usages,
    }
})