export default defineEventHandler(async (event) => {
    const { appName, orgName } = await getValidatedQuery(event, z.object({
        appName: z.string().trim().min(1).max(128),
        orgName: z.string().trim().min(1).max(128),
    }).parse)

    const db = event.context.drizzle
    const apiKeys = await db.select()
        .from(tables.apiKeys)
        .leftJoin(tables.users, eq(tables.users.id, tables.apiKeys.appsId))
        .leftJoin(tables.organizations, eq(tables.organizations.id, tables.apiKeys.organizationId))
        .leftJoin(tables.organizationsPeople, eq(tables.organizationsPeople.organizationId, tables.organizations.id))
        .leftJoin(tables.apps, eq(tables.apps.id, tables.apiKeys.appsId))
        .where(and(
            eq(tables.apps.name, appName),
            eq(tables.organizations.name, orgName),
            eq(tables.organizationsPeople.userId, event.context.auth.userId),
        ))
        .orderBy(desc(tables.apiKeys.createdAt))
    return {
        apiKeys,
    }
})
