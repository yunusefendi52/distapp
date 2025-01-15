import { count } from "drizzle-orm"
import type { EventHandlerRequest, H3Event } from "h3"

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const orgName = query.orgName?.toString()
    const appName = query.appName?.toString()
    if (!orgName || !appName) {
        setResponseStatus(event, 400)
        return
    }
    const groupName = query.groupName?.toString() // optional
    const groups = await getListGroups(event, orgName, appName, groupName, 'list')
    return groups?.list || []
})

export async function getListGroups(
    event: H3Event<EventHandlerRequest>,
    orgName: string,
    appName: string,
    groupName: string | undefined,
    returnAs: 'list' | 'count') {
    const db = event.context.drizzle
    const { userApp } = await getUserApp(event, orgName, appName)
    if (returnAs === 'list') {
        const groups = await db.select()
            .from(tables.artifactsGroups)
            .where(and(
                eq(tables.artifactsGroups.appsId, userApp.id),
                ...(groupName ? [eq(tables.artifactsGroups.name, groupName)] : [])
            ))
            .orderBy(tables.artifactsGroups.name)
        return {
            list: groups,
        }
    } else if (returnAs === 'count') {
        const groups = await db.select({
            count: count()
        })
            .from(tables.artifactsGroups)
            .where(and(
                eq(tables.artifactsGroups.appsId, userApp.id),
                ...(groupName ? [eq(tables.artifactsGroups.name, groupName)] : [])
            )).then(takeUniqueOrThrow)
        return {
            count: groups.count,
        }
    }
}