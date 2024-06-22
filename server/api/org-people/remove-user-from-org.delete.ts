import { and, eq } from "drizzle-orm"
import { organizations, organizationsPeople, users } from "../../db/schema"
import { takeUniqueOrThrow } from "../detail-app.get"

export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
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
    await db.delete(organizationsPeople)
        .where(and(
            eq(organizationsPeople.organizationId, orgIdFromOrgName.orgId),
            eq(organizationsPeople.userId, userIdFromEmail.userId),
        ))

    return { ok: true }
})
