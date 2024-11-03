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
    const userId = event.context.auth.userId
    const db = event.context.drizzle
    const { userApp: app } = await getUserApp(event, orgName, appName)
    await db.insert(tables.artifactsGroups).values({
        id: generateId(),
        name: normalizeName(groupName),
        displayName: groupName,
        appsId: app!.id,
        publicId: generateRandomPassword(42),
    })
    return {
        ok: true,
    }
})
