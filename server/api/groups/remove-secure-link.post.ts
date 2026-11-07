export default defineEventHandler(async (event) => {
    const { orgName, appName, artifactGroupId } = await readValidatedBody(event, z.object({
        orgName: z.string().max(256),
        appName: z.string().max(256),
        artifactGroupId: z.string().max(256),
    }).parse)
    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }
    const { userApp } = await getUserApp(event, orgName, appName)
    const db = event.context.drizzle
    await db.update(tables.artifactsGroups).set({
        secureLink: null,
        updatedAt: new Date(),
    }).where(and(
        eq(tables.artifactsGroups.id, artifactGroupId),
        eq(tables.artifactsGroups.appsId, userApp.id),
    ))
    return {
        ok: true,
    }
})
