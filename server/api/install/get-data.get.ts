import { and, eq } from "drizzle-orm"
import { organizations, organizationsPeople } from "~/server/db/schema"
import { takeUniqueOrThrow } from "../detail-app.get"

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const publicId = query.publicId?.toString()
    if (!publicId) {
        setResponseStatus(event, 401)
        return
    }

    const db = event.context.drizzle
    const artifactGroup = await db.query.artifactsGroups.findMany({
        where(fields, operators) {
            return operators.eq(fields.publicId, publicId)
        },
    }).then(takeUniqueOrThrow)
    const app = await db.query.apps.findMany({
        where(fields, operators) {
            return operators.eq(fields.id, artifactGroup.appsId!)
        },
    }).then(takeUniqueOrThrow)
    const org = await db.query.organizations.findMany({
        where(fields, operators) {
            return operators.eq(fields.id, app.organizationsId!)
        },
    }).then(takeUniqueOrThrow)
    const artifacts = await db.query.artifacts.findMany({
        where(fields, operators) {
            return operators.eq(fields.appsId, app.id)
        },
        orderBy(fields, operators) {
            return operators.desc(fields.createdAt)
        },
        limit: 100, // TODO: pagination?  
    })
    return {
        app,
        org,
        artifactGroup,
        artifacts,
    }
})
