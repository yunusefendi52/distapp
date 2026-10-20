import { runPurgeArtifact } from "~/server/tasks/purgeArtifact"
import { runRetentionPurge } from "~/server/tasks/retention-purge"
import { runPurgeUploadTemp } from "~/server/tasks/purgeUploadTemp"

export default defineEventHandler(async (event) => {
    const { runTaskKey, taskName } = await getValidatedQuery(event, z.object({
        runTaskKey: z.string().min(1),
        taskName: z.string().nullish(),
    }).parse)

    if (runTaskKey !== process.env.NUXT_RUN_TASK_KEY) {
        throw createError({
            message: 'Not found',
            statusCode: 404,
        })
    }

    if (taskName === 'purgeUploadTemp') {
        return await runPurgeUploadTemp(event)
    } else if (taskName === 'purgeArtifact') {
        return await runPurgeArtifact(event)
    } else if (taskName === 'retention-purge') {
        return await runRetentionPurge(event)
    } else {
        throw createError({
            message: 'Not found',
            statusCode: 404,
        })
    }
})
