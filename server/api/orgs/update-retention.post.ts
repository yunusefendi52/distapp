const retentionOrgSchema = z.object({
    orgName: z.string().trim().min(1).max(128),
    retentionEnabled: z.boolean(),
    retentionMode: z.enum(['latest', 'days']),
    retentionKeepLatest: z.number().int().min(1).max(256),
    retentionKeepDays: z.number().int().min(1).max(730),
})

export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const {
        orgName,
        retentionEnabled,
        retentionMode,
        retentionKeepLatest,
        retentionKeepDays,
    } = await readValidatedBody(event, retentionOrgSchema.parse)
    const canEdit = await roleEditAllowed(event, orgName)
    if (!canEdit) {
        throw createError({
            message: 'Unauthorized update organization retention',
            statusCode: 401,
        })
    }
    const userOrg = await getUserOrg(event, orgName)
    await db.update(tables.organizations).set({
        retentionEnabled,
        retentionMode,
        retentionKeepLatest,
        retentionKeepDays,
        updatedAt: new Date(),
    }).where(eq(tables.organizations.id, userOrg.org!.id))
    return {
        updated: true,
    }
})
