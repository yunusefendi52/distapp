import { artifactsGroups, organizations, organizationsPeople } from "~/server/db/schema"
import { and, eq } from 'drizzle-orm'
import { takeUniqueOrThrow } from "../detail-app.get"

export default defineEventHandler(async (event) => {
    const { appName, orgName, groupName } = await readBody(event)
    const userId = event.context.auth.userId
    const db = event.context.drizzle
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
    await db.insert(artifactsGroups).values({
        id: generateId(),
        name: normalizeName(groupName),
        appsId: app!.id,
    })
    return {
        ok: true,
    }
})
