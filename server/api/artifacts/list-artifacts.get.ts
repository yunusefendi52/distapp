export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const query = await getValidatedQuery(event, z.object({
        appName: z.string().trim().min(1).max(128),
        orgName: z.string().trim().min(1).max(128),
        groups: z.any(),
        groupName: z.string().nullish(),
        page: z.string().optional().transform(e => e ? parseInt(e) : undefined),
        pageSize: z.string().optional().transform(e => e ? parseInt(e) : undefined),
    }).parse)
    const { appName, orgName, groups, groupName } = query
    const pageNo = Math.max(query.page ?? 1, 1)
    const pageSizeNo = Math.min(Math.max(query.pageSize ?? 50, 1), 50)
    const groupIds: string[] = Array.isArray(groups) ? groups : (groups ? [groups] : [])
    const { userApp: app } = await getUserApp(event, orgName, appName)
    if (groupName) {
        const groupNameArtifact = await db.select({
            groupId: tables.artifactsGroups.id,
        }).from(tables.artifactsGroups)
            .where(and(
                eq(tables.artifactsGroups.appsId, app.id),
                eq(tables.artifactsGroups.name, groupName),
            ))
            .then(takeUniqueOrThrow)
        groupIds.push(groupNameArtifact.groupId)
    }
    const groupsQuery = db.select({
        artifactId: tables.artifacts.id,
        names: sql`group_concat(coalesce(${tables.artifactsGroups.displayName}, ${tables.artifactsGroups.name}), ', ')`.as('names'),
        groupIds: sql`json_group_array(${tables.artifactsGroups.id})`.as('groupIds'),
    })
        .from(tables.artifacts)
        .leftJoin(tables.artifactsGroupsManager, and(eq(tables.artifactsGroupsManager.artifactsId, tables.artifacts.id)))
        .leftJoin(tables.artifactsGroups, and(eq(tables.artifactsGroups.id, tables.artifactsGroupsManager.artifactsGroupsId)))
        .groupBy(tables.artifacts.id)
        .as('groups')
    const artifactGroups = await db.select({
        artifacts: tables.artifacts,
        groups: {
            artifactId: groupsQuery.artifactId,
            names: groupsQuery.names,
            groupIds: groupsQuery.groupIds,
        },
    })
        .from(tables.artifacts)
        .leftJoin(groupsQuery, eq(groupsQuery.artifactId, tables.artifacts.id))
        .where(and(
            eq(tables.artifacts.appsId, app.id),
            groupIds.length ? sql`
            exists(select * from json_each(${groupsQuery.groupIds}) as j where j.value in ${groupIds})
            ` : sql`true`,
        ))
        .orderBy(desc(tables.artifacts.releaseId))
        .limit(pageSizeNo)
        .offset((pageNo - 1) * pageSizeNo)
    artifactGroups.forEach(v => {
        v.artifacts.fileObjectKey = ''
        if (v.groups) {
            v.groups.artifactId = ''
        }
    })
    return artifactGroups
})
