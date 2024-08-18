export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const userId = event.context.auth.userId
    const query = getQuery(event)
    const { appName, orgName, groups } = query
    const { groupName } = query as { groupName: string | undefined }
    const groupIds: string[] = Array.isArray(groups) ? groups : (groups ? [groups] : [])
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
        names: sql`group_concat(${tables.artifactsGroups.name}, ', ')`.as('names'),
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
    artifactGroups.forEach(v => {
        v.artifacts.fileObjectKey = ''
        if (v.groups) {
            v.groups.artifactId = ''
        }
    })
    return artifactGroups
})
