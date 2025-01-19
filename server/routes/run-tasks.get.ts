import { runPurgeArtifact } from "~/server/tasks/purgeArtifact"
import { runPurgeUploadTemp } from "~/server/tasks/purgeUploadTemp"

export default defineEventHandler(async (event) => {
    const { runTaskKey, taskName } = await getValidatedQuery(event, z.object({
        runTaskKey: z.string().nullish(),
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
    } else {
        setResponseStatus(event, 404, 'Not found')
    }
})
