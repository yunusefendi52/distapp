import { v4 } from "uuid"
import { organizations, organizationsPeople } from "../db/schema"
import { generateId } from "../utils/utils"

export default defineEventHandler(async (event) => {
    const userId = event.context.auth.userId
    const db = event.context.drizzle
    const { name, displayName } = await readBody(event)
    const normalizedOrgName = `${normalizeName(name)}-${v4().substring(0, 7)}`
    await db.transaction(async t => {
        const organizationId = generateId()
        await t.insert(organizations).values({
            id: organizationId,
            name: normalizedOrgName,
            displayName: displayName,
        })
        await t.insert(organizationsPeople).values({
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
