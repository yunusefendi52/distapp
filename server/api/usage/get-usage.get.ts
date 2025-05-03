export default defineEventHandler(async event => {
    const userId = event.context.auth.userId
    const db = event.context.drizzle
    const usages = await db.select({
        orgDisplayName: tables.organizations.displayName,
        storageSize: sql<number>`sum(${tables.artifacts.fileContentLength}) + sum(coalesce(${tables.artifacts.fileApkContentLength}, 0))`
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

    return {
        totalStorage: usages.reduce((p, value) => value.storageSize + p, 0),
        usages,
    }
})