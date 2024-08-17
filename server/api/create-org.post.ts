import { v4 } from "uuid"
import { generateId } from "../utils/utils"

export default defineEventHandler(async (event) => {
    const userId = event.context.auth.userId
    const db = event.context.drizzle
    const { name, displayName } = await readBody(event)
    const normalizedOrgName = `${normalizeName(name)}-${v4().substring(0, 7)}`
    await db.transaction(async t => {
        const organizationId = generateId()
        await t.insert(tables.organizations).values({
            id: organizationId,
            name: normalizedOrgName,
            displayName: displayName,
        })
        await t.insert(tables.organizationsPeople).values({
            userId: userId,
            organizationId: organizationId,
            role: 'admin',
        })
    })
    return {
        normalizedOrgName,
        ok: true,
    }
})
