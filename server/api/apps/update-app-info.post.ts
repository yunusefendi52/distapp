export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const {
        orgName,
        appDisplayName,
        appName,
        currentOrgId,
    } = await readValidatedBody(event, z.object({
        orgName: z.string().trim().min(1).max(128),
        appDisplayName: z.string().trim().min(1).max(128),
        appName: z.string().trim().min(1).max(128),
        currentOrgId: z.string().trim().min(1).max(128),
    }).parse)
    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized update app',
            statusCode: 401,
        })
    }
    const { userApp, userOrg } = await getUserApp(event, orgName, currentOrgId)
    const newAppName = normalizeName(appName)
    await db.update(tables.apps).set({
        displayName: appDisplayName.trim(),
        name: newAppName,
    }).where(and(
        eq(tables.apps.id, userApp.id),
        eq(tables.apps.organizationsId, userOrg.org!.id),
    ))
    return {
        updated: true,
        appName: newAppName,
    }
})
