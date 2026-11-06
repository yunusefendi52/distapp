export default defineEventHandler(async (event) => {
    const { orgName } = await getValidatedQuery(event, z.object({
        orgName: z.string().trim().min(1),
    }).parse)
    const db = event.context.drizzle

    const currentUserRole = await getCurrentUserRole(event, orgName, event.context.auth.userId)
    if (!currentUserRole.role) {
        throw createError({
            statusCode: 403,
            message: 'Not a member of this org',
        })
    }

    const orgOwner = await db.select({
        name: tables.users.name,
        email: tables.users.email,
    })
        .from(tables.organizationsPeople)
        .innerJoin(tables.organizations, eq(tables.organizations.id, tables.organizationsPeople.organizationId))
        .innerJoin(tables.users, eq(tables.users.id, tables.organizationsPeople.userId))
        .where(and(
            eq(tables.organizations.name, orgName),
            eq(tables.organizationsPeople.role, 'owner'),
        ))
        .then(takeUniqueOrThrow)
    return {
        orgOwner,
    }
})
