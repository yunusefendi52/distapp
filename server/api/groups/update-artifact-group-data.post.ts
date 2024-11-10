export default defineEventHandler(async (event) => {
    const {
        artifactGroupId,
        orgName,
        appName,
        groupDisplayName,
        isPublic
    } = await readValidatedBody(event, z.object({
        artifactGroupId: z.string().max(256),
        orgName: z.string().max(256),
        appName: z.string().max(256),
        groupDisplayName: z.string().max(256),
        isPublic: z.string().nullish().transform(e => e === 'true'),
    }).parse)
    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }
    const userApp = await getUserApp(event, orgName, appName)
    const db = event.context.drizzle
    const now = new Date()
    const groupName = normalizeName(groupDisplayName)
    await db.update(tables.artifactsGroups).set({
        name: groupName,
        displayName: groupDisplayName,
        publicId: groupName,
        isPublic: isPublic,
        updatedAt: now,
    }).where(and(
        eq(tables.artifactsGroups.id, artifactGroupId),
        eq(tables.artifactsGroups.appsId, userApp.userApp.id),
    ))
    return {
        ok: true,
        artifactGroupName: groupName,
    }
})
