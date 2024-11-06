import { lt } from "drizzle-orm";
import db from "../db/db";
import { S3Fetch } from "../services/s3fetch";

export default defineTask({
    meta: {
        name: "cleanupTempFile",
        description: "Cleanup temporary files",
    },
    async run({ payload, context }) {
        const env = process.env
        const drizzle = db({
            ...env,
            enableLogging: false,
        })
        var threshold = new Date();
        threshold.setHours(threshold.getHours() - 1);
        const tempFiles = await drizzle.select()
            .from(tables.uploadTemp)
            .where(lt(tables.uploadTemp.createdAt, threshold))
            .orderBy(asc(tables.uploadTemp.createdAt))
            .limit(15)
        if (tempFiles && tempFiles.length) {
            const s3 = new S3Fetch()
            await Promise.all(tempFiles.map(async tempFile => {
                await drizzle.transaction(async t => {
                    await s3.deleteObject(tempFile.fileKey)
                    await t.delete(tables.uploadTemp)
                        .where(eq(tables.uploadTemp.id, tempFile.id))
                })
                console.log('Deleted temp file', tempFile.id)
            }))
        }

        return { result: "Success" };
    },
});
