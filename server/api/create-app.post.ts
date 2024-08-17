import { eq } from 'drizzle-orm'
import { generateId } from '../utils/utils'

export default defineEventHandler(async (event) => {
    const request = await readBody(event)
    const db = event.context.drizzle
    const org = await db.select({
        orgName: tables.organizations.name,
    })
        .from(tables.organizations)
        .where(eq(tables.organizations.id, request.orgId))
        .then(takeUniqueOrThrow)
    if (await roleEditNotAllowed(event, org.orgName)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }
    await db.insert(tables.apps).values({
        id: generateId(),
        displayName: request.name,
        name: normalizeName(request.name),
        osType: request.osType,
        organizationsId: request.orgId,
    })
    return {}
})
