import { and, asc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const orgName = query.orgName?.toString()
    const userId = event.context.auth.userId
    const db = event.context.drizzle
    const orgs = await db.select({
        id: tables.organizations.id,
        name: tables.organizations.name,
        displayName: tables.organizations.displayName,
    })
        .from(tables.organizations)
        .innerJoin(tables.organizationsPeople, and(
            eq(tables.organizationsPeople.organizationId, tables.organizations.id),
            eq(tables.organizationsPeople.userId, userId),
            ...[orgName
                ? eq(tables.organizations.name, orgName)
                : undefined
            ],
        ))
        .orderBy(asc(tables.organizations.displayName))
    return orgs
})
