import { isNull, lt, ne } from "drizzle-orm";
import db from "../db/db";
import { S3Fetch } from "../services/s3fetch";

export default defineTask({
    meta: {
        name: "purgeArtifact",
        description: "Purge artifact",
    },
    async run({ payload, context }) {
        console.log('Staring purge artifact')

        const env = process.env
        const drizzle = db({
            ...env,
            enableLogging: false,
        })
        const [purgeAppArtifact, purgeAppNonArtifact] = await Promise.all([
            drizzle.select().from(tables.purgeAppArtifact)
                .orderBy(desc(tables.purgeAppArtifact.createdAt))
                .where(eq(tables.purgeAppArtifact.hasArtifact, 1))
                .limit(1)
                .then(singleOrDefault),
            drizzle.select().from(tables.purgeAppArtifact)
                .orderBy(asc(tables.purgeAppArtifact.hasArtifact))
                .where(or(
                    ne(tables.purgeAppArtifact.hasArtifact, 1),
                    isNull(tables.purgeAppArtifact.hasArtifact),
                ))
                .limit(1)
                .then(singleOrDefault),
        ])
        if (!purgeAppArtifact && !purgeAppNonArtifact) {
            return {
                result: {
                    status: 'nothing to purge',
                }
            }
        }

        async function purgeArtifactInternal() {
            if (purgeAppArtifact) {
                await drizzle.transaction(async tx => {
                    const hasArtifact = purgeAppArtifact.hasArtifact === 1 ? true : false
                    if (hasArtifact) {
                        console.log('Purge has artifact, will check storage', purgeAppArtifact.appId)
                        const storageOrgPrefix = getStorageKeysOrg(purgeAppArtifact.orgId!, purgeAppArtifact.appId!)
                        throw 'purging storage not implemented, keys ' + storageOrgPrefix
                    }

                    await tx.delete(tables.purgeAppArtifact)
                        .where(and(
                            eq(tables.purgeAppArtifact.orgId, purgeAppArtifact.orgId!),
                            eq(tables.purgeAppArtifact.appId, purgeAppArtifact.appId!),
                        ))
                })
            }
        }
        async function purgeNonArtifactInternal() {
            if (purgeAppNonArtifact) {
                await drizzle.delete(tables.purgeAppArtifact)
                    .where(and(
                        eq(tables.purgeAppArtifact.orgId, purgeAppNonArtifact.orgId!),
                        eq(tables.purgeAppArtifact.appId, purgeAppNonArtifact.appId!),
                    ))
            }
        }
        const results = await Promise.allSettled([purgeArtifactInternal(), purgeNonArtifactInternal()])
        results.forEach(e => {
            console.log('Result purge artifact', e)
        })

        console.log('Finished purge artifact')

        return {
            result: {
                status: `purged ${new Date().toISOString()}`,
            },
        };
    },
});