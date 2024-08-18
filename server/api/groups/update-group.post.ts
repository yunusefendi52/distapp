export type UpdateGroupRequest = {
    currentOrgId: string
    orgName: string
    orgDisplayName: string
}

export default defineEventHandler(async (event) => {
    var { currentOrgId, orgDisplayName, orgName } = await readBody<UpdateGroupRequest>(event)
    orgDisplayName = orgDisplayName.trim()
    orgName = orgName.trim()
    if (!orgName || !orgDisplayName) {
        throw createError({
            message: 'Invalid request',
        })
    }

    const db = event.context.drizzle
    const org = await db.select({
        id: tables.organizations.id,
        orgName: tables.organizations.name,
    })
        .from(tables.organizations)
        .where(eq(tables.organizations.id, currentOrgId))
        .then(takeUniqueOrThrow)
    if (await roleEditNotAllowed(event, org.orgName)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }
    const newOrg = await db.update(tables.organizations)
        .set({
            displayName: orgDisplayName,
            name: normalizeName(orgName),
        })
        .where(and(
            eq(tables.organizations.id, org.id),
        ))
        .returning()
        .then(takeUniqueOrThrow)
    return {
        success: true,
        org: newOrg,
    }
})