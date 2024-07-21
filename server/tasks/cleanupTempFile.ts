import { asc, desc, eq, gt, lt } from "drizzle-orm";
import db from "../db/db";
import { uploadTemp } from "../db/schema";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

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
            .from(uploadTemp)
            .where(lt(uploadTemp.createdAt, threshold))
            .orderBy(asc(uploadTemp.createdAt))
        if (tempFiles && tempFiles.length) {
            const s3 = new S3Client({
                endpoint: env.NUXT_S3_ENDPOINT as string,
                region: 'auto',
                credentials: {
                    accessKeyId: env.NUXT_S3_ACCESS_KEY_ID as string,
                    secretAccessKey: env.NUXT_S3_SECRET_ACCESS_KEY as string,
                },
            })
            await Promise.all(tempFiles.map(async tempFile => {
                await s3.send(new DeleteObjectCommand({
                    Bucket: s3BucketName,
                    Key: tempFile.fileKey,
                }))
                await drizzle.delete(uploadTemp)
                    .where(eq(uploadTemp.id, tempFile.id))
                console.log('Deleted temp file', tempFile.id)
            }))
        }

        return { result: "Success" };
    },
});
