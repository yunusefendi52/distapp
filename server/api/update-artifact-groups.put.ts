import { eq } from "drizzle-orm"

export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const request = await readBody<UpdateGroupsRequest>(event)

    await db.transaction(async tx => {
        await tx.delete(tables.artifactsGroupsManager).where(eq(tables.artifactsGroupsManager.artifactsId, request.artifactId))
        if (request.groupIds && request.groupIds.length) {
            await tx.insert(tables.artifactsGroupsManager).values(request.groupIds.map(e => ({
                artifactsId: request.artifactId,
                artifactsGroupsId: e,
            })))
        }
    })

    return {
        ok: true,
    }
})

export interface UpdateGroupsRequest {
    artifactId: string,
    groupIds: string[]
}
