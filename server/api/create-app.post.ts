import { eq } from 'drizzle-orm'
import { generateId } from '../utils/utils'

export default defineEventHandler(async (event) => {
    const { name, orgId, osType } = await readValidatedBody(event, z.object({
        name: z.string().min(1).max(128).trim().transform(normalizeName),
        orgId: z.string().min(1).trim(),
        osType: z.enum(['ios', 'android']),
    }).parse)
    const db = event.context.drizzle
    const org = await db.select({
        orgName: tables.organizations.name,
    })
        .from(tables.organizations)
        .where(eq(tables.organizations.id, orgId))
        .then(takeUniqueOrThrow)
    if (await roleEditNotAllowed(event, org.orgName)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }
    await db.insert(tables.apps).values({
        id: generateId(),
        displayName: name,
        name: name,
        osType: osType,
        organizationsId: orgId,
    })
    return {}
})
