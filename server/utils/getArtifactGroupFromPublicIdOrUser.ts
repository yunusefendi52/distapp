import { ne } from "drizzle-orm"
import type { EventHandlerRequest, H3Event } from "h3"

export const getArtifactGroupFromPublicIdOrUser = async (event: H3Event<EventHandlerRequest>, orgName: string, appName: string, publicId: string) => {
    const db = event.context.drizzle
    const userId = event.context.auth?.userId
    const item = await db.select()
        .from(tables.artifactsGroups)
        .leftJoin(tables.apps, eq(tables.apps.id, tables.artifactsGroups.appsId))
        .leftJoin(tables.organizations, eq(tables.organizations.id, tables.apps.organizationsId))
        .leftJoin(tables.organizationsPeople, eq(tables.organizationsPeople.organizationId, tables.organizations.id))
        .where(and(
            or(
                and(
                    eq(tables.artifactsGroups.isPublic, true),
                    eq(tables.artifactsGroups.publicId, publicId),
                ),
            ),
            eq(tables.apps.name, appName),
            eq(tables.organizations.name, orgName),
        ))
        .then(singleOrDefault)
    if (!item) {
        console.error('Cannot find artifact log')
        throw createError({
            message: 'Cannot find artifact',
            statusCode: 400,
        })
    }
    const { artifactsGroups: artifactGroup } = item
    return {
        app: item.apps!,
        org: item.organizations!,
        artifactGroup,
    }
}
