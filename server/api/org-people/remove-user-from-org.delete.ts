import { and, eq } from "drizzle-orm"
import { organizations, organizationsPeople, users } from "../../db/schema"
import { takeUniqueOrThrow } from "../detail-app.get"
import type { EventHandlerRequest, H3Event } from "h3"

export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const { email, orgName } = await readBody(event)

    const { userId } = await canEditRole(event, orgName, email)

    const orgIdFromOrgName = await db.select({
        orgId: organizations.id,
    }).from(organizations)
        .where(eq(organizations.name, orgName))
        .then(takeUniqueOrThrow)
    await db.delete(organizationsPeople)
        .where(and(
            eq(organizationsPeople.organizationId, orgIdFromOrgName.orgId),
            eq(organizationsPeople.userId, userId),
        ))

    return { ok: true }
})

export const getCurrentUserRole = async (
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

export const canEditRole = async (
    event: H3Event<EventHandlerRequest>,
    orgName: string,
    userEmail: string) => {
    const userId = event.context.auth.userId
    const db = event.context.drizzle
    const currentUserRole = await getCurrentUserRole(event, orgName, userId)
    if (!currentUserRole.role || currentUserRole.role !== 'admin') {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }
    const userIdFromEmail = await db.select({
        userId: users.id,
    }).from(users)
        .where(eq(users.email, userEmail))
        .then(takeUniqueOrThrow)

    if (userId === userIdFromEmail.userId) {
        throw createError({
            message: 'Unauthorized change your own role',
            statusCode: 401,
        })
    }

    return {
        userId: userIdFromEmail.userId,
    }
}