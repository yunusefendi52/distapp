import { and, eq } from "drizzle-orm"
import { artifacts, artifactsGroups, artifactsGroupsManager, organizations, organizationsPeople } from "~/server/db/schema"
import { getStorageKeys } from "~/server/utils/utils"
import { takeUniqueOrThrow } from "../detail-app.get"

export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const userId = event.context.auth.userId
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
    const artficats = await db.query.artifacts.findMany({
        where(fields, operators) {
            return operators.eq(fields.appsId, app.id)
        },
        orderBy(fields, operators) {
            return operators.desc(fields.releaseId)
        },
    })
    const artifactGroups = await Promise.all(artficats.map(async e => {
        const groups = await db.select()
            .from(artifactsGroups)
            .leftJoin(artifactsGroupsManager, eq(artifactsGroupsManager.artifactsGroupsId, artifactsGroups.id))
            .where(eq(artifactsGroups.id, e.id))
        return {
            ...e,
            groups,
        }
    }))
    return artifactGroups
})
