import { and, eq, sql } from "drizzle-orm"
import { organizations, organizationsPeople } from "../db/schema"

export default defineEventHandler(async (event) => {
    const userId = event.context.auth.userId
    const db = event.context.drizzle
    const { search, orgName } = getQuery<ListAppsRequest>(event)
    const userOrgs = await db.select({
        id: organizations.id,
    })
        .from(organizations)
        .innerJoin(organizationsPeople, and(
            eq(organizationsPeople.organizationId, organizations.id),
            eq(organizationsPeople.userId, userId)))
        .where(orgName ? eq(organizations.name, orgName.toString()) : undefined)
    const userOrgIds = userOrgs.map(e => e.id)
    const apps = await db.query.apps.findMany({
        with: {
            organization: true,
        },
        where(fields, operators) {
            return operators.and(
                userOrgIds.length ? operators.inArray(fields.organizationsId, userOrgIds) : operators.sql`false`,
                search ? operators.like(fields.displayName, search) : undefined,
            )
        },
        orderBy(fields, operators) {
            return operators.asc(fields.name)
        },
    })
    return apps
})

export interface ListAppsRequest {
    search?: string
    orgName?: string
}
