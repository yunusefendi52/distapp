import type { EventHandlerRequest, H3Event } from "h3"
import { organizations, organizationsPeople, users } from "../db/schema"
import { and, eq } from "drizzle-orm"

const getCurrentUserRole = async (
    event: H3Event<EventHandlerRequest>,
    orgName: string,
    userId: string) => {
    const db = event.context.drizzle
    const currentUserRole = await db.select({
        role: organizationsPeople.role,
    }).from(organizationsPeople)
        .leftJoin(organizations, eq(organizations.id, organizationsPeople.organizationId))
        .where(and(
            eq(organizations.name, orgName),
            eq(organizationsPeople.userId, userId),
        ))
        .then(takeUniqueOrThrow)
    return currentUserRole
}

export const roleEditAllowed = async (
    event: H3Event<EventHandlerRequest>,
    orgName: string) => {
    const userId = event.context.auth.userId
    const db = event.context.drizzle
    const currentUserRole = await getCurrentUserRole(event, orgName, userId)
    return currentUserRole.role && currentUserRole.role === 'admin'
}

export const roleEditNotAllowed = async (
    event: H3Event<EventHandlerRequest>,
    orgName: string) => {
    return !(await roleEditAllowed(event, orgName))
}
