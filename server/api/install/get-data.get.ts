import { and, desc, eq, like } from "drizzle-orm"
import { secureLinkMaxLength } from "~/utils/secure-link"

export default defineEventHandler(async (event) => {
    const { orgName, appName, publicId, releaseId, artifactId, page, pageSize, search, secureLink } = await getValidatedQuery(event, z.object({
        orgName: z.string().min(1).max(128),
        appName: z.string().min(1).max(128),
        publicId: z.string().min(1).max(128),
        releaseId: z.string().optional().transform(e => e ? parseInt(e) : undefined),
        artifactId: z.string().optional(),
        secureLink: z.string().max(secureLinkMaxLength).optional(),
        page: z.string().optional().transform(e => e ? parseInt(e) : undefined),
        pageSize: z.string().optional().transform(e => e ? parseInt(e) : undefined),
        search: z.string().max(128).optional(),
    }).parse)
    if (!publicId) {
        setResponseStatus(event, 401)
        return
    }
    const pageNo = Math.max(page ?? 1, 1)
    const pageSizeNo = Math.min(Math.max(pageSize ?? 10, 1), 50)

    const searchQuery = (search ?? '').trim()
    const db = event.context.drizzle
    const { app, artifactGroup, org } = await getArtifactGroupFromPublicIdOrUser(event, orgName, appName, publicId, secureLink)
    const artifactList = await db.select()
        .from(tables.artifactsGroupsManager)
        .leftJoin(tables.artifacts, eq(tables.artifacts.id, tables.artifactsGroupsManager.artifactsId))
        .where(and(
            eq(tables.artifactsGroupsManager.artifactsGroupsId, artifactGroup.id),
            ...(releaseId ? [eq(tables.artifacts.releaseId, releaseId)] : []),
            ...(artifactId ? [eq(tables.artifacts.id, artifactId)] : []),
            ...(searchQuery ? [like(tables.artifacts.versionName2, `%${searchQuery}%`)] : []),
        ))
        .orderBy(desc(tables.artifacts.createdAt))
        .limit(pageSizeNo)
        .offset((pageNo - 1) * pageSizeNo)
    const { secureLink: _secureLink, ...publicArtifactGroup } = artifactGroup
    return {
        app,
        org,
        artifactGroup: publicArtifactGroup,
        artifacts: artifactList,
    }
})
