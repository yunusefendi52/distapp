export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const currentUserId = event.context.auth.userId
    const { roleId, email, orgName } = await readValidatedBody(event, z.object({
        roleId: z.enum(["admin", "collaborator"]),
        email: z.string().email(),
        orgName: z.string().trim().min(1),
    }).parse)

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

    if (currentUserId === userIdFromEmail.userId) {
        throw createError({
            message: 'Unauthorized change your own role',
            statusCode: 401,
        })
    }

    const orgIdFromOrgName = await db.select({
        orgId: tables.organizations.id,
    }).from(tables.organizations)
        .where(eq(tables.organizations.name, orgName))
        .then(takeUniqueOrThrow)
    await db.update(tables.organizationsPeople)
        .set({
            role: roleId,
        }).where(and(
            eq(tables.organizationsPeople.userId, userIdFromEmail.userId),
            eq(tables.organizationsPeople.organizationId, orgIdFromOrgName.orgId),
        ))

    return { ok: true }
})
