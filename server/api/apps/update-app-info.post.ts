export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const {
        orgName,
        appDisplayName,
        appName,
        currentOrgId,
    } = await readBody<{
        orgName: string,
        appDisplayName: string,
        appName: string,
        currentOrgId: string,
    }>(event)
    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized update app',
            statusCode: 401,
        })
    }
    const { userApp, userOrg } = await getUserApp(event, orgName, currentOrgId)
    console.log('111111', currentOrgId)
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
