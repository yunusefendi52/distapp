import { and, eq, sql } from "drizzle-orm"
import { artifactsGroups, organizations, organizationsPeople } from "~/server/db/schema"

export default defineEventHandler(async (event) => {
    const { appName, orgName, groupId } = await readBody<RegenerateLinkReq>(event)
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

    const artifactGroupsWhere = and(
        eq(artifactsGroups.id, groupId),
        eq(artifactsGroups.appsId, app.id),
    )
    const group = await db.select()
        .from(artifactsGroups)
        .where(artifactGroupsWhere)
        .then(takeUniqueOrThrow)
    if (!group.publicId) {
        throw createError({
            statusCode: 400,
            message: 'Your group is not public link'
        })
    }

    await db.update(artifactsGroups).set({
        publicId: generateRandomPassword(42),
    }).where(artifactGroupsWhere)

    return {
        ok: true,
        message: 'public link updated',
    }
})

interface RegenerateLinkReq {
    orgName: string
    appName: string
    groupId: string
}