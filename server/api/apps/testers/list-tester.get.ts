import { count } from "drizzle-orm"
import type { EventHandlerRequest, H3Event } from "h3"

export default defineEventHandler(async (event) => {
    var { orgName, appName, groupName } = await getValidatedQuery(event, z.object({
        orgName: z.string().max(128),
        appName: z.string().max(128),
        groupName: z.string().max(128),
    }).parse)

    const db = event.context.drizzle
    const { userApp } = await getUserApp(event, orgName, appName)
    const testers = await getListApikeys(event, userApp.organizationsId!, userApp.id, groupName, 'list')
    return {
        testers: testers?.list || [],
    }
})

export async function getListApikeys(
    event: H3Event<EventHandlerRequest>,
    orgId: string,
    appId: string,
    groupName: string,
    returnAs: 'list' | 'count'
) {
    const db = event.context.drizzle
    if (returnAs === 'list') {
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
                eq(tables.groupTester.organizationId, orgId),
                eq(tables.groupTester.appsId, appId),
                eq(tables.artifactsGroups.name, groupName),
            ))
        return {
            list: testers,
        }
    } else if (returnAs === 'count') {
        const testers = await db.select({
            count: count()
        })
            .from(tables.groupTester)
            .leftJoin(tables.artifactsGroups, eq(tables.artifactsGroups.id, tables.groupTester.artifactGroupId))
            .leftJoin(tables.users, eq(tables.users.id, tables.groupTester.testerId))
            .where(and(
                eq(tables.groupTester.organizationId, orgId),
                eq(tables.groupTester.appsId, appId),
                eq(tables.artifactsGroups.name, groupName),
            )).then(takeUniqueOrThrow)
        return {
            count: testers.count,
        }
    }
}
