export default defineEventHandler(async (event) => {
    const { appName, orgName, groupName } = await readValidatedBody(event, z.object({
        appName: z.string().max(256),
        orgName: z.string().max(256),
        groupName: z.string().max(256),
    }).parse)
    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }

    const db = event.context.drizzle
    const { userApp: app } = await getUserApp(event, orgName, appName)
    const d = await db.delete(tables.artifactsGroups)
        .where(and(
            eq(tables.artifactsGroups.name, groupName),
            eq(tables.artifactsGroups.appsId, app.id),
        ))

    return {
        deleted: new Date(),
    }
})
