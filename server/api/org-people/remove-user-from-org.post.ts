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
        userId: tables.users.id,
    }).from(tables.users)
        .where(eq(tables.users.email, email))
        .then(takeUniqueOrThrow)
    const orgIdFromOrgName = await db.select({
        orgId: tables.organizations.id,
    }).from(tables.organizations)
        .where(eq(tables.organizations.name, orgName))
        .then(takeUniqueOrThrow)
    if (currentUserId === userIdFromEmail.userId) {
        throw createError({
            message: 'Unauthorized change your own role',
            statusCode: 400,
        })
    }

    await db.delete(tables.organizationsPeople)
        .where(and(
            eq(tables.organizationsPeople.organizationId, orgIdFromOrgName.orgId),
            eq(tables.organizationsPeople.userId, userIdFromEmail.userId),
        ))

    return { ok: true }
})
