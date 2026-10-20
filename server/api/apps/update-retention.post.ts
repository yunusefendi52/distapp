const retentionAppSchema = z.object({
    orgName: z.string().trim().min(1).max(128),
    appName: z.string().trim().min(1).max(128),
    retentionEnabled: z.boolean(),
    // 'inherit' means this app follows the organization level settings
    retentionMode: z.enum(['latest', 'days', 'inherit']),
    retentionKeepLatest: z.number().int().min(1).max(256).nullish(),
    retentionKeepDays: z.number().int().min(1).max(730).nullish(),
})

export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const {
        orgName,
        appName,
        retentionEnabled,
        retentionMode,
        retentionKeepLatest,
        retentionKeepDays,
    } = await readValidatedBody(event, retentionAppSchema.parse)
    const canEdit = await roleEditAllowed(event, orgName)
    if (!canEdit) {
        throw createError({
            message: 'Unauthorized update retention',
            statusCode: 401,
        })
    }
    const { userApp, userOrg } = await getUserApp(event, orgName, appName)
    const isInheritMode = retentionMode === 'inherit'
    await db.update(tables.apps).set({
        retentionEnabled: isInheritMode ? false : retentionEnabled,
        retentionMode,
        retentionKeepLatest: isInheritMode ? null : (retentionKeepLatest ?? null),
        retentionKeepDays: isInheritMode ? null : (retentionKeepDays ?? null),
        updatedAt: new Date(),
    }).where(and(
        eq(tables.apps.id, userApp.id),
        eq(tables.apps.organizationsId, userOrg.org!.id),
    ))
    return {
        updated: true,
    }
})
