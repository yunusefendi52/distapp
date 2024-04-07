import _ from 'lodash'
import { apps } from '../db/schema'
import { generateId } from '../utils/utils'

export default defineEventHandler(async (event) => {
    const request = await readBody(event)
    const db = event.context.drizzle
    await db.insert(apps).values({
        id: generateId(),
        displayName: request.name,
        name: normalizeName(request.name),
        osType: request.osType,
        organizationsId: request.orgId,
    })
    return {}
})
