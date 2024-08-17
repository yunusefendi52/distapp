export default defineEventHandler(async (event) => {
    const { app: { apiAuthKey } } = useRuntimeConfig(event)
    if (!apiAuthKey) {
        throw createError({
            message: 'Please provide using env NUXT_APP_API_AUTH_KEY',
            statusCode: 500,
        })
    }

    if (!event.context.auth.userId) {
        setResponseStatus(event, 401, 'Unauthorized')
        return
    }

    const { orgName, appName } = await readBody(event)

    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }

    const userId = event.context.auth.userId
    const db = event.context.drizzle
    const userOrg = await db.select({
        organizationsId: tables.organizations.id,
    })
        .from(tables.organizationsPeople)
        .leftJoin(tables.organizations, eq(tables.organizations.id, tables.organizationsPeople.organizationId))
        .where(and(eq(tables.organizationsPeople.userId, userId), eq(tables.organizations.name, orgName!.toString())))
        .then(takeUniqueOrThrow)
    const app = await db.query.apps.findMany({
        where(fields, operators) {
            return operators.and(operators.eq(fields.organizationsId, userOrg.organizationsId!), operators.eq(fields.name, appName!.toString()))
        },
        limit: 2,
    }).then(takeUniqueOrThrow)
    const id = generateId()
    const token = await generateTokenWithOptions(event, {
        id,
    }, v => v, apiAuthKey)
    await db.insert(tables.apiKeys).values({
        id: id,
        createdAt: new Date(),
        appsId: app.id,
        organizationId: userOrg.organizationsId,
    })

    return {
        token: token,
    }
})
