import { and, eq } from "drizzle-orm"
import { apps, organizations, organizationsPeople } from "../db/schema"

export const takeUniqueOrThrow = <T extends any[]>(values: T): T[number] => {
    if (values.length !== 1) throw new Error(`Found non unique or inexistent value ${values}`)
    return values[0]!
}

export default defineEventHandler(async (event) => {
    const userId = event.context.auth.userId
    const db = event.context.drizzle
    const { appName, orgName } = getQuery(event)
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
    return app
})
