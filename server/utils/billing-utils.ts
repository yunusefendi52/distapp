import type { EventHandlerRequest, H3Event } from "h3"

export async function tryReportUsageBill(event: H3Event<EventHandlerRequest>, orgId: string) {
    if (!isBillingEnabled(event)) {
        return
    }

    const { isSubsActive, artifactSizeLimit } = await getUserFeature(event, orgId)
    if (!isSubsActive) {
        return
    }

    let { artifactSize } = await getArtifactSizeByOrg(event, orgId)
    // if (import.meta.dev) {
    //     artifactSize = 5200 * 1024 * 1024
    // }
    const appLimitProSizeBytes = artifactSizeLimit * 1024 * 1024
    if (artifactSize <= appLimitProSizeBytes) {
        // Don't record if the usage data is less than fixed storage
        return
    }

    const db = event.context.drizzle
    const orgOwner = await db.select({
        id: tables.users.id,
        email: tables.users.email,
    })
        .from(tables.organizationsPeople)
        .leftJoin(tables.organizations, eq(tables.organizations.id, tables.organizationsPeople.organizationId))
        .leftJoin(tables.users, eq(tables.users.id, tables.organizationsPeople.userId))
        .where(and(
            eq(tables.organizations.id, orgId),
            eq(tables.organizationsPeople.role, 'owner'),
        ))
        .then(singleOrDefault)
    if (!orgOwner) {
        throw createError({
            message: `Owner of this org could not be found ${orgId}`,
        })
    }

    const polar = createPollar()

    // TODO: remove after migrated to new billing
    const customers = await polar.customers.list({
        limit: 1,
        email: orgOwner.email!,
        metadata: {
            userId: orgOwner.id!,
        },
    })
    if (!customers.result.items.length) {
        throw createError({
            message: `You're not subscribed to our usage based plan yet.`,
        })
    }

    // Get artifact size substracted by fixed storage (from artifact size limit) for usage based
    const diffLimitSizeBytes = (artifactSize - appLimitProSizeBytes) / (1000 * 1024 * 1024)
    // Rounding up (to 1)
    const storageSizeUnit = Math.ceil(diffLimitSizeBytes)
    await polar.events.ingest({
        events: [
            {
                name: "storage-usage",
                externalCustomerId: orgOwner.id!,
                metadata: {
                    storageSize: storageSizeUnit,
                },
            },
        ],
    })
}
