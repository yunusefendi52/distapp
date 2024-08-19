import type { EventHandlerRequest, H3Event } from "h3"

export const getUserOrg = async (
    event: H3Event<EventHandlerRequest>,
    orgName: string,
) => {
    const db = event.context.drizzle
    const userOrg = await db.select({
        org: tables.organizations,
    })
        .from(tables.organizationsPeople)
        .leftJoin(tables.organizations, eq(tables.organizations.id, tables.organizationsPeople.organizationId))
        .where(and(eq(tables.organizationsPeople.userId, event.context.auth.userId), eq(tables.organizations.name, orgName!.toString())))
        .then(takeUniqueOrThrow)
    return userOrg
}

export const getUserApp = async (
    event: H3Event<EventHandlerRequest>,
    orgName: string,
    appName: string,
) => {
    const db = event.context.drizzle
    const userOrg = await getUserOrg(event, orgName)
    const app = await db.query.apps.findMany({
        where(fields, operators) {
            return operators.and(operators.eq(fields.organizationsId, userOrg.org!.id!), operators.eq(fields.name, appName!.toString()))
        },
    }).then(takeUniqueOrThrow)
    return {
        userApp: app,
        userOrg,
    }
}