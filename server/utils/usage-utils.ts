import type { EventHandlerRequest, H3Event } from "h3";

// Just need to know which org first, and then move up ward
export async function getArtifactSizeByOrg(event: H3Event<EventHandlerRequest>, orgId: string) {
    const db = event.context.drizzle

    const orgOwner = await db.select({
        id: tables.users.id,
    })
        .from(tables.organizationsPeople)
        .leftJoin(tables.organizations, eq(tables.organizations.id, tables.organizationsPeople.organizationId))
        .leftJoin(tables.users, eq(tables.users.id, tables.organizationsPeople.userId))
        .where(and(
            eq(tables.organizations.id, orgId),
            eq(tables.organizationsPeople.role, 'owner'),
        ))
        .then(takeUniqueOrThrow)

    // TODO: Optimize????
    const artifactSize = await event.context.drizzle.select({
        sumContentLength: sql<number>`sum(${tables.artifacts.fileContentLength}) + sum(coalesce(${tables.artifacts.fileApkContentLength}, 0))`,
    }).from(tables.artifacts)
        .leftJoin(tables.organizations, eq(tables.organizations.id, tables.artifacts.organizationId))
        .leftJoin(tables.organizationsPeople, eq(tables.organizationsPeople.organizationId, tables.organizations.id))
        .where(and(
            eq(tables.organizationsPeople.userId, orgOwner.id!),
            eq(tables.organizationsPeople.role, 'owner'),
        ))
        .then(takeUniqueOrThrow)
    return {
        artifactSize: artifactSize.sumContentLength,
    }
}
