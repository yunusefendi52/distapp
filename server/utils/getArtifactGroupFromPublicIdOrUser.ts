import { ne } from "drizzle-orm"
import type { EventHandlerRequest, H3Event } from "h3"


export const getArtifactGroupFromPublicIdOrUser = async (event: H3Event<EventHandlerRequest>, orgName: string, appName: string, publicId: string) => {
    const db = event.context.drizzle
    const userId = event.context.auth?.userId

    async function getArtifact(usePublicId: boolean) {
        var item = await db.select({
            artifactsGroups: getTableColumns(tables.artifactsGroups),
            apps: getTableColumns(tables.apps),
            organizations: getTableColumns(tables.organizations),
            organizationsPeople: getTableColumns(tables.organizationsPeople),
        })
            .from(tables.artifactsGroups)
            .leftJoin(tables.apps, eq(tables.apps.id, tables.artifactsGroups.appsId))
            .leftJoin(tables.organizations, eq(tables.organizations.id, tables.apps.organizationsId))
            .leftJoin(tables.organizationsPeople, eq(tables.organizationsPeople.organizationId, tables.organizations.id))
            .leftJoin(tables.groupTester, eq(tables.groupTester.artifactGroupId, tables.artifactsGroups.id))
            .where(and(
                usePublicId ? and(
                    eq(tables.artifactsGroups.isPublic, true),
                    eq(tables.artifactsGroups.publicId, publicId),
                ) : and(
                    eq(tables.groupTester.testerId, userId),
                    eq(tables.artifactsGroups.publicId, publicId),
                ),
                eq(tables.apps.name, appName),
                eq(tables.organizations.name, orgName),
            ))
            .then(singleOrDefault)
        return item
    }

    var item = await getArtifact(true)
    if (!item) {
        console.log('Still cannot find artifact, find using userId')
        item = await getArtifact(false)
    }
    if (!item) {
        console.error('Cannot find artifact log')
        throw createError({
            message: 'App installation not found',
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
