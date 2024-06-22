import { eq } from 'drizzle-orm'
import { apps, organizations } from '../db/schema'
import { generateId } from '../utils/utils'
import { takeUniqueOrThrow } from './detail-app.get'

export default defineEventHandler(async (event) => {
    const request = await readBody(event)
    const db = event.context.drizzle
    const org = await db.select({
        orgName: organizations.name,
    })
        .from(organizations)
        .where(eq(organizations.id, request.orgId))
        .then(takeUniqueOrThrow)
    if (await roleEditNotAllowed(event, org.orgName)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }
    await db.insert(apps).values({
        id: generateId(),
        displayName: request.name,
        name: normalizeName(request.name),
        osType: request.osType,
        organizationsId: request.orgId,
    })
    return {}
})
