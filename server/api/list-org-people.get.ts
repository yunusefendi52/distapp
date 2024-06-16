import { organizations, organizationsPeople, users } from "../db/schema"
import { and, asc, desc, eq } from 'drizzle-orm'
import { takeUniqueOrThrow } from "./detail-app.get"
import { getCurrentUserRole } from "./org-people/change-role.post"

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
        email: users.email,
        createdAt: organizationsPeople.createdAt,
        role: organizationsPeople.role,
    })
        .from(organizationsPeople)
        .leftJoin(users, eq(users.id, organizationsPeople.userId))
        .where(and(eq(organizationsPeople.organizationId, orgId.orgId)))
        .orderBy(asc(users.name))
    const currentUserRole = await getCurrentUserRole(event, orgName, userId)
    return {
        canChange: currentUserRole.role === 'admin',
        people,
    }
})
