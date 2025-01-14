import type { EventHandlerRequest, H3Event } from "h3"

export const getCurrentUserRole = async (
    event: H3Event<EventHandlerRequest>,
    orgName: string,
    userId: string) => {
    const db = event.context.drizzle
    const currentUserRole = await db.select({
        role: tables.organizationsPeople.role,
    }).from(tables.organizationsPeople)
        .leftJoin(tables.organizations, eq(tables.organizations.id, tables.organizationsPeople.organizationId))
        .where(and(
            eq(tables.organizations.name, orgName),
            eq(tables.organizationsPeople.userId, userId),
        ))
        .then(takeUniqueOrThrow)
    return currentUserRole
}

export const roleEditAllowed = async (
    event: H3Event<EventHandlerRequest>,
    orgName: string) => {
    const userId = event.context.auth.userId
    const currentUserRole = await getCurrentUserRole(event, orgName, userId)
    return currentUserRole.role && (currentUserRole.role === 'admin' || currentUserRole.role === 'owner')
}

export const roleEditNotAllowed = async (
    event: H3Event<EventHandlerRequest>,
    orgName: string) => {
    return !(await roleEditAllowed(event, orgName))
}
