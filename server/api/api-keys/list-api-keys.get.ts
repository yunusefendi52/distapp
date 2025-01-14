import { count } from "drizzle-orm"
import type { EventHandlerRequest, H3Event } from "h3"

export default defineEventHandler(async (event) => {
    const { appName, orgName } = await getValidatedQuery(event, z.object({
        appName: z.string().trim().min(1).max(128),
        orgName: z.string().trim().min(1).max(128),
    }).parse)

    const listApiKeys = await getListApikeys(event, appName, orgName, 'list')

    return {
        apiKeys: listApiKeys?.list || [],
    }
})

export async function getListApikeys(
    event: H3Event<EventHandlerRequest>,
    appName: string,
    orgName: string,
    returnAs: 'list' | 'count'
) {
    const db = event.context.drizzle
    if (returnAs === 'list') {
        const apiKeys = await db.select()
            .from(tables.apiKeys)
            .leftJoin(tables.organizations, eq(tables.organizations.id, tables.apiKeys.organizationId))
            .leftJoin(tables.organizationsPeople, eq(tables.organizationsPeople.organizationId, tables.organizations.id))
            .leftJoin(tables.apps, eq(tables.apps.id, tables.apiKeys.appsId))
            .where(and(
                eq(tables.apps.name, appName),
                eq(tables.organizations.name, orgName),
                eq(tables.organizationsPeople.userId, event.context.auth.userId),
            ))
            .orderBy(desc(tables.apiKeys.createdAt))
        return {
            list: apiKeys,
        }
    } else if (returnAs === 'count') {
        const apiKeys = await db.select({
            count: count(),
        })
            .from(tables.apiKeys)
            .leftJoin(tables.organizations, eq(tables.organizations.id, tables.apiKeys.organizationId))
            .leftJoin(tables.organizationsPeople, eq(tables.organizationsPeople.organizationId, tables.organizations.id))
            .leftJoin(tables.apps, eq(tables.apps.id, tables.apiKeys.appsId))
            .where(and(
                eq(tables.apps.name, appName),
                eq(tables.organizations.name, orgName),
                eq(tables.organizationsPeople.userId, event.context.auth.userId),
            ))
            .then(takeUniqueOrThrow)
        return {
            count: apiKeys.count,
        }
    }
}
