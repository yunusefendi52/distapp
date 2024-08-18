export default defineEventHandler(async (event) => {
    const { apiKeyId, appName, orgName } = getQuery<{ apiKeyId: string, appName: string, orgName: string }>(event)

    const canEdit = await roleEditAllowed(event, orgName)
    if (!canEdit) {
        throw createError({
            message: 'You cannot do this',
            statusCode: 400,
        })
    }

    const db = event.context.drizzle

    const detail = await db.select({
        apiKeyId: tables.apiKeys.id,
    }).from(tables.apiKeys)
        .leftJoin(tables.apps, and(
            eq(tables.apps.id, tables.apiKeys.appsId),
            eq(tables.apps.organizationsId, tables.apiKeys.organizationId),
        ))
        .leftJoin(tables.organizations, and(
            eq(tables.organizations.id, tables.apps.organizationsId),
        ))
        .leftJoin(tables.organizationsPeople, and(
            eq(tables.organizationsPeople.organizationId, tables.organizations.id),
        ))
        .where(and(
            eq(tables.apps.name, appName),
            eq(tables.organizations.name, orgName),
            eq(tables.apiKeys.id, apiKeyId),
            eq(tables.organizationsPeople.userId, event.context.auth.userId),
        ))
        .then(takeUniqueOrThrow)
    await db.delete(tables.apiKeys)
        .where(and(
            eq(tables.apiKeys.id, detail.apiKeyId),
        ))

    return {
        deleted: true,
    }
})
