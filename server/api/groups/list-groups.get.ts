export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const orgName = query.orgName?.toString()
    const appName = query.appName?.toString()
    if (!orgName || !appName) {
        setResponseStatus(event, 400)
        return
    }

    const db = event.context.drizzle
    const userId = event.context.auth.userId
    const userOrg = await db.select({
        organizationsId: tables.organizations.id,
    })
        .from(tables.organizationsPeople)
        .leftJoin(tables.organizations, eq(tables.organizations.id, tables.organizationsPeople.organizationId))
        .where(and(eq(tables.organizationsPeople.userId, userId), eq(tables.organizations.name, orgName!.toString())))
        .then(takeUniqueOrThrow)
    const app = await db.query.apps.findMany({
        where(fields, operators) {
            return operators.and(operators.eq(fields.organizationsId, userOrg.organizationsId!), operators.eq(fields.name, appName!.toString()))
        },
    }).then(takeUniqueOrThrow)

    const groupName = query.groupName?.toString() // optional
    const groups = await db.query.artifactsGroups.findMany({
        where: (t, o) => {
            return o.and(
                o.eq(t.appsId, app!.id),
                groupName ? o.eq(t.name, groupName) : sql`true`,
            )
        },
        orderBy(fields, operators) {
            return operators.asc(fields.name)
        },
    })
    return groups
})
