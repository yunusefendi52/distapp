import { generateTokenWithOptions } from "~/server/utils/token-utils"

export default defineEventHandler(async (event) => {
    var { orgName, email } = await readValidatedBody(event, z.object({
        orgName: z.string().max(128),
        email: z.string().min(1).max(128),
    }).parse)
    email = email.trim()
    if (!email) {
        throw createError({
            message: 'Invalid request, need email',
            statusCode: 400,
        })
    }

    const userId = event.context.auth.userId
    const db = event.context.drizzle
    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }
    const org = await db.select({
        id: tables.organizations.id,
    })
        .from(tables.organizations)
        .innerJoin(tables.organizationsPeople, and(
            eq(tables.organizationsPeople.organizationId, tables.organizations.id),
            eq(tables.organizationsPeople.userId, userId)))
        .where(and(
            eq(tables.organizations.name, orgName),
            eq(tables.organizationsPeople.userId, userId),
        ))
        .then(takeUniqueOrThrow)
    const inviteLink = await generateTokenWithOptions(event, {
        id: org.id,
        email: email,
    }, (v) => {
        return v.setExpirationTime('1 hour')
    })
    return {
        inviteLink,
    }
})
