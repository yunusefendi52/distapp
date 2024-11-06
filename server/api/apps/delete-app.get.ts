export default defineEventHandler(async (event) => {
    const { orgName, appName } = await getValidatedQuery(event, z.object({
        orgName: z.string().min(1).max(256),
        appName: z.string().min(1).max(256),
    }).parse)
    const db = event.context.drizzle
    const canEdit = await roleEditAllowed(event, orgName)
    if (!canEdit) {
        throw createError({
            message: 'You cannot do this to app',
            statusCode: 400,
        })
    }

    const userApp = await getUserApp(event, orgName, appName)
    const orgId = userApp.userOrg.org!.id
    const appId = userApp.userApp.id
    await db.batch([
        db.delete(tables.apps)
            .where(and(
                eq(tables.apps.organizationsId, orgId),
                eq(tables.apps.id, appId),
            )),
    ])

    await sendRedirect(event, `/orgs/${orgName}`)
})
