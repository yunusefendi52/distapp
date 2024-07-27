import { and, eq } from "drizzle-orm"
import { organizations, organizationsPeople, users } from "../../db/schema"

export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const currentUserId = event.context.auth.userId
    const { email, orgName } = await readBody(event)

    if (await roleEditNotAllowed(event, orgName)) {        
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }

    const userIdFromEmail = await db.select({
        userId: users.id,
    }).from(users)
        .where(eq(users.email, email))
        .then(takeUniqueOrThrow)
    const orgIdFromOrgName = await db.select({
        orgId: organizations.id,
    }).from(organizations)
        .where(eq(organizations.name, orgName))
        .then(takeUniqueOrThrow)
    if (currentUserId === userIdFromEmail.userId) {
        throw createError({
            message: 'Unauthorized change your own role',
            statusCode: 400,
        })
    }

    await db.delete(organizationsPeople)
        .where(and(
            eq(organizationsPeople.organizationId, orgIdFromOrgName.orgId),
            eq(organizationsPeople.userId, userIdFromEmail.userId),
        ))

    return { ok: true }
})
