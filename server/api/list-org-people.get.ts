import { organizations, organizationsPeople, users } from "../db/schema"
import { and, asc, eq } from 'drizzle-orm'
import { takeUniqueOrThrow } from "./detail-app.get"

export default defineEventHandler(async (event) => {
    const userId = event.context.auth.userId
    const db = event.context.drizzle
    const query = getQuery(event)
    const orgName = query.orgName?.toString() ?? ''
    const orgId = await db.select({
        orgId: organizations.id,
    }).from(organizations)
        .leftJoin(organizationsPeople, eq(organizations.id, organizationsPeople.organizationId))
        .where(and(
            eq(organizations.name, orgName),
            eq(organizationsPeople.userId, userId),
        ))
        .limit(1)
        .then(takeUniqueOrThrow)

    const people = await db.select({
        profileName: users.name,
    })
        .from(organizationsPeople)
        .leftJoin(users, eq(users.id, organizationsPeople.userId))
        .where(and(eq(organizationsPeople.organizationId, orgId.orgId)))
    return people
})
