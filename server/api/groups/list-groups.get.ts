import { organizations, organizationsPeople, organizationsPeopleRelations } from "~/server/db/schema"
import { and, eq } from "drizzle-orm"

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
    const groups = await db.query.artifactsGroups.findMany({
        where: (t, o) => o.eq(t.appsId, app!.id),
        orderBy(fields, operators) {
            return operators.asc(fields.name)
        },
    })
    return groups
})
