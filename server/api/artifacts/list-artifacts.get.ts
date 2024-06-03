import { and, desc, eq, inArray, like, sql } from "drizzle-orm"
import { artifacts, artifactsGroups, artifactsGroupsManager, organizations, organizationsPeople } from "~/server/db/schema"
import { getStorageKeys } from "~/server/utils/utils"
import { takeUniqueOrThrow } from "../detail-app.get"
import { concat } from "drizzle-orm/sqlite-core/expressions"

export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const userId = event.context.auth.userId
    const query = getQuery(event)
    const { appName, orgName, groups } = query
    const groupIds: string[] = Array.isArray(groups) ? groups : (groups ? [groups] : [])
    const userOrg = await db.select({
        organizationsId: organizations.id,
    })
        .from(organizationsPeople)
        .leftJoin(organizations, eq(organizations.id, organizationsPeople.organizationId))
        .where(and(eq(organizationsPeople.userId, userId), eq(organizations.name, orgName!.toString())))
        .then(takeUniqueOrThrow)
    const app = await db.query.apps.findMany({
        where(fields, operators) {
            return operators.and(operators.eq(fields.organizationsId, userOrg.organizationsId!), operators.eq(fields.name, appName!.toString()))
        },
    }).then(takeUniqueOrThrow)
    const groupsQuery = db.select({
        artifactId: artifacts.id,
        names: sql`group_concat(${artifactsGroups.name}, ', ')`.as('names'),
        groupIds: sql`json_group_array(${artifactsGroups.id})`.as('groupIds'),
    })
        .from(artifacts)
        .leftJoin(artifactsGroupsManager, and(eq(artifactsGroupsManager.artifactsId, artifacts.id)))
        .leftJoin(artifactsGroups, and(eq(artifactsGroups.id, artifactsGroupsManager.artifactsGroupsId)))
        .groupBy(artifacts.id)
        .as('groups')
    const artifactGroups = await db.select({
        artifacts: artifacts,
        groups: {
            artifactId: groupsQuery.artifactId,
            names: groupsQuery.names,
            groupIds: groupsQuery.groupIds,
        },
    })
        .from(artifacts)
        .leftJoin(groupsQuery, eq(groupsQuery.artifactId, artifacts.id))
        .where(and(
            eq(artifacts.appsId, app.id),
            groupIds.length ? sql`
            exists(select * from json_each(${groupsQuery.groupIds}) as j where j.value in ${groupIds})
            ` : sql`true`,
        ))
        .orderBy(desc(artifacts.releaseId))
    artifactGroups.forEach(v => {
        v.artifacts.fileObjectKey = ''
        if (v.groups) {
            v.groups.artifactId = ''
        }
    })
    return artifactGroups
})
