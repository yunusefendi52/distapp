export default defineEventHandler(async (event) => {
    const { orgName } = await getValidatedQuery(event, z.object({
        orgName: z.string().trim().min(1),
    }).parse)
    const db = event.context.drizzle
    const orgOwner = await db.select({
        name: tables.users.name,
        email: tables.users.email,
    })
        .from(tables.organizationsPeople)
        .leftJoin(tables.organizations, eq(tables.organizations.id, tables.organizationsPeople.organizationId))
        .leftJoin(tables.users, eq(tables.users.id, tables.organizationsPeople.userId))
        .where(and(
            eq(tables.organizations.name, orgName),
            eq(tables.organizationsPeople.role, 'owner'),
        ))
        .then(takeUniqueOrThrow)
    return {
        orgOwner,
    }
})
