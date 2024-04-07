import { organizations, organizationsPeople } from "../db/schema"
import { and, asc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const userId = event.context.auth.userId
    const db = event.context.drizzle
    const orgs = await db.select({
        id: organizations.id,
        name: organizations.name,
        displayName: organizations.displayName,
    })
        .from(organizations)
        .innerJoin(organizationsPeople, and(
            eq(organizationsPeople.organizationId, organizations.id),
            eq(organizationsPeople.userId, userId)))
        .orderBy(asc(organizations.name))
    return orgs
})
