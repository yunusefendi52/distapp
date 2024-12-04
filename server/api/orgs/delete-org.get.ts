export default defineEventHandler(async (event) => {
    const { orgName } = await getValidatedQuery(event, z.object({
        orgName: z.string().trim().min(1),
    }).parse)
    const db = event.context.drizzle
    const userId = event.context.auth.userId
    const canEdit = await roleEditAllowed(event, orgName)
    if (!canEdit) {
        throw createError({
            message: 'You cannot do this to org',
            statusCode: 400,
        })
    }

    const org = await db.select({
        id: tables.organizations.id,
    })
        .from(tables.organizations)
        .leftJoin(tables.organizationsPeople, eq(tables.organizationsPeople.organizationId, tables.organizations.id))
        .where(and(
            eq(tables.organizations.name, orgName),
            eq(tables.organizationsPeople.userId, userId),
        ))
        .then(takeUniqueOrThrow)
    await db.batch([
        db.delete(tables.apps)
            .where(eq(tables.apps.organizationsId, org.id)),
        db.delete(tables.organizationsPeople)
            .where(eq(tables.organizationsPeople.organizationId, org.id)),
        db.delete(tables.organizations)
            .where(eq(tables.organizations.id, org.id)),
    ])

    return {
        deleted: 1,
    }
})
