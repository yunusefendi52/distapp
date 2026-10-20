const retentionGroupSchema = z.object({
    orgName: z.string().trim().min(1).max(128),
    appName: z.string().trim().min(1).max(128),
    groupId: z.string().trim().min(1).max(128),
    retentionEnabled: z.boolean(),
    retentionMode: z.enum(['latest', 'days', 'inherit']),
    retentionKeepLatest: z.number().int().min(1).max(256).nullish(),
    retentionKeepDays: z.number().int().min(1).max(730).nullish(),
})

export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const {
        orgName,
        appName,
        groupId,
        retentionEnabled,
        retentionMode,
        retentionKeepLatest,
        retentionKeepDays,
    } = await readValidatedBody(event, retentionGroupSchema.parse)
    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized update retention',
            statusCode: 401,
        })
    }
    const { userApp } = await getUserApp(event, orgName, appName)
    const groups = await db.select({
        id: tables.artifactsGroups.id,
    })
        .from(tables.artifactsGroups)
        .where(and(
            eq(tables.artifactsGroups.id, groupId),
            eq(tables.artifactsGroups.appsId, userApp.id),
        ))
    const group = groups[0]
    if (!group) {
        throw createError({
            message: 'Group not found',
            statusCode: 404,
        })
    }
    await db.update(tables.artifactsGroups).set({
        retentionEnabled,
        retentionMode,
        retentionKeepLatest: retentionMode === 'inherit' ? null : (retentionKeepLatest ?? null),
        retentionKeepDays: retentionMode === 'inherit' ? null : (retentionKeepDays ?? null),
        updatedAt: new Date(),
    }).where(and(
        eq(tables.artifactsGroups.id, group.id),
        eq(tables.artifactsGroups.appsId, userApp.id),
    ))
    return {
        updated: true,
    }
})
