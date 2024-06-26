import { and, eq } from "drizzle-orm"
import { organizations, organizationsPeople } from "~/server/db/schema"
import { generateTokenWithOptions } from "~/server/utils/token-utils"

export default defineEventHandler(async (event) => {
    const { orgName } = await readBody(event)
    const userId = event.context.auth.userId
    const db = event.context.drizzle
    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }
    const org = await db.select({
        id: organizations.id,
    })
        .from(organizations)
        .innerJoin(organizationsPeople, and(
            eq(organizationsPeople.organizationId, organizations.id),
            eq(organizationsPeople.userId, userId)))
        .where(and(
            eq(organizations.name, orgName),
            eq(organizationsPeople.userId, userId),
        ))
        .then(takeUniqueOrThrow)
    const inviteLink = await generateTokenWithOptions(event, {
        id: org.id,
    }, (v) => {
        return v.setExpirationTime('1 hour')
    })
    return {
        inviteLink,
    }
})
