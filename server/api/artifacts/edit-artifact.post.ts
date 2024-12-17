export default defineEventHandler(async (event) => {
    const { orgName, appName, releaseId, releaseNotes } = await readValidatedBody(event, z.object({
        orgName: z.string().min(1).max(128),
        appName: z.string().min(1).max(128),
        releaseId: z.string().min(1).transform(e => parseInt(e)),
        releaseNotes: z.string().max(5000).nullish(),
    }).parse)

    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Request edit artifact not valid',
            statusCode: 400,
        })
    }

    const { userApp } = await getUserApp(event, orgName, appName)

    const db = event.context.drizzle
    await db.update(tables.artifacts)
        .set({
            releaseNotes: releaseNotes,
        })
        .where(and(
            eq(tables.artifacts.organizationId, userApp.organizationsId!),
            eq(tables.artifacts.appsId, userApp.id),
            eq(tables.artifacts.releaseId, releaseId),
        ))
})
