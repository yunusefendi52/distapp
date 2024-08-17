import { and, asc, desc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const userId = event.context.auth.userId
    const db = event.context.drizzle
    const query = getQuery(event)
    const orgName = query.orgName?.toString() ?? ''
    const orgId = await db.select({
        orgId: tables.organizations.id,
    }).from(tables.organizations)
        .leftJoin(tables.organizationsPeople, eq(tables.organizations.id, tables.organizationsPeople.organizationId))
        .where(and(
            eq(tables.organizations.name, orgName),
            eq(tables.organizationsPeople.userId, userId),
        ))
        .limit(1)
        .then(takeUniqueOrThrow)

    const people = await db.select({
        profileName: tables.users.name,
        email: tables.users.email,
        createdAt: tables.organizationsPeople.createdAt,
        role: tables.organizationsPeople.role,
    })
        .from(tables.organizationsPeople)
        .leftJoin(tables.users, eq(tables.users.id, tables.organizationsPeople.userId))
        .where(and(eq(tables.organizationsPeople.organizationId, orgId.orgId)))
        .orderBy(asc(tables.users.name))
    const canEdit = await roleEditAllowed(event, orgName)
    return {
        canChange: canEdit,
        people,
    }
})
