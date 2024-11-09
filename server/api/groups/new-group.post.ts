export default defineEventHandler(async (event) => {
    const { appName, orgName, groupName, isPublic } = await readValidatedBody(event, z.object({
        appName: z.string().max(256),
        orgName: z.string().max(256),
        groupName: z.string().max(256),
        isPublic: z.boolean(),
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
    const now = new Date()
    await db.insert(tables.artifactsGroups).values({
        id: generateId(),
        name: normalizeName(groupName),
        displayName: groupName,
        appsId: app!.id,
        publicId: normalizeName(groupName),
        isPublic: isPublic,
        createdAt: now,
        updatedAt: now,
    })
    return {
        ok: true,
    }
})
