export default defineEventHandler(async (event) => {
    var { orgName, appName, groupName } = await getValidatedQuery(event, z.object({
        orgName: z.string().max(128),
        appName: z.string().max(128),
        groupName: z.string().max(128),
    }).parse)

    const db = event.context.drizzle
    const { userApp, userOrg } = await getUserApp(event, orgName, appName)
    const testers = await db.select({
        groupTester: getTableColumns(tables.groupTester),
        artifactsGroups: getTableColumns(tables.artifactsGroups),
        users: {
            id: tables.users.id,
            email: tables.users.email,
        },
    })
        .from(tables.groupTester)
        .leftJoin(tables.artifactsGroups, eq(tables.artifactsGroups.id, tables.groupTester.artifactGroupId))
        .leftJoin(tables.users, eq(tables.users.id, tables.groupTester.testerId))
        .where(and(
            eq(tables.groupTester.organizationId, userOrg.org!.id!),
            eq(tables.groupTester.appsId, userApp.id),
            eq(tables.artifactsGroups.name, groupName),
        ))
    return {
        testers,
    }
})
