import type { JoinTesterPayload } from "~/server/models/JoinTesterPayload"

export default defineEventHandler(async (event) => {
    const { token } = await getValidatedQuery(event, z.object({
        token: z.string().min(1),
    }).parse)

    const { app: { apiAuthKey } } = useRuntimeConfig(event)
    const joinTesterPayload = await verifyToken(event, token, apiAuthKey) as JoinTesterPayload

    const auth = event.context.auth
    // if (joinTesterPayload.email !== auth.email) {
    //     throw createError({
    //         message: 'Invitation not found, make sure you have the correct account',
    //         statusCode: 400,
    //     })
    // }

    const db = event.context.drizzle
    const sel = await db.select()
        .from(tables.organizations)
        .leftJoin(tables.apps, eq(tables.apps.organizationsId, tables.organizations.id))
        .leftJoin(tables.artifactsGroups, eq(tables.artifactsGroups.appsId, tables.apps.id))
        .where(and(
            eq(tables.organizations.id, joinTesterPayload.orgId),
            eq(tables.apps.id, joinTesterPayload.appId),
            eq(tables.artifactsGroups.name, joinTesterPayload.groupName),
        ))
        .then(singleOrDefault)
    return sel ? {
        app: sel.apps!,
        org: sel.organizations!,
        group: sel.artifactsGroups,
    } : undefined
})
