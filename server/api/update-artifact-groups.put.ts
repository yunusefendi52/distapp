import { eq } from "drizzle-orm"
import { artifactsGroups, artifactsGroupsManager, artifactsGroupsRelations } from "../db/schema"

export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    const request = await readBody<UpdateGroupsRequest>(event)

    await db.transaction(async tx => {
        await tx.delete(artifactsGroupsManager).where(eq(artifactsGroupsManager.artifactsId, request.artifactId))
        if (request.groupIds && request.groupIds.length) {
            await tx.insert(artifactsGroupsManager).values(request.groupIds.map(e => ({
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
