import type { EventHandlerRequest, H3Event } from "h3";

export async function getArtifactSizeByOrg(event: H3Event<EventHandlerRequest>, orgId: string) {
    // Across orgs
    // TODO: Optimize????
    const artifactSize = await event.context.drizzle.select({
        sumContentLength: sql<number>`sum(${tables.artifacts.fileContentLength}) + sum(coalesce(${tables.artifacts.fileApkContentLength}, 0))`,
    }).from(tables.artifacts)
        .where(and(
            eq(tables.artifacts.organizationId, orgId),
        ))
        .then(takeUniqueOrThrow)
    return {
        artifactSize: artifactSize.sumContentLength,
    }
}