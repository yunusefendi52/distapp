import { lt } from "drizzle-orm";
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
        const purgeAppArtifact = await drizzle.select().from(tables.purgeAppArtifact)
            .orderBy(desc(tables.purgeAppArtifact.createdAt))
            .limit(1)
            .then(singleOrDefault)
        if (!purgeAppArtifact) {
            return {
                result: {
                    status: 'nothing to purge',
                }
            }
        }

        await drizzle.transaction(async tx => {
            const hasArtifact = purgeAppArtifact.hasArtifact === 1 ? true : false
            if (hasArtifact) {
                console.log('Purge has artifact, will check storage', purgeAppArtifact.appId)
                throw 'purging storage not implemented'
            }

            await tx.delete(tables.purgeAppArtifact)
                .where(and(
                    eq(tables.purgeAppArtifact.orgId, purgeAppArtifact.orgId!),
                    eq(tables.purgeAppArtifact.appId, purgeAppArtifact.appId!),
                ))
        })

        console.log('Finished purge artifact')

        return {
            result: {
                status: `purged ${new Date().toISOString()}`,
            },
        };
    },
});