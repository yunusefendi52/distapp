import { count, eq } from 'drizzle-orm'
import { generateId } from '../utils/utils'

export default defineEventHandler(async (event) => {
    const { name, orgId, osType } = await readValidatedBody(event, z.object({
        name: z.string().min(1).max(128).trim(),
        orgId: z.string().min(1).trim(),
        osType: z.enum(['ios', 'android']),
    }).parse)
    const db = event.context.drizzle
    const org = await getUserOrg(event, '', orgId)
    if (await roleEditNotAllowed(event, org.org!.name)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }

    if (process.env.IS_RUNNING_TEST !== '1') {
        const allOrgApps = await db.select({
            count: count(),
        }).from(tables.apps)
            .where(and(
                eq(tables.apps.organizationsId, orgId),
            )).then(takeUniqueOrThrow)
        const { appLimit: appSize } = await getUserFeature(event, orgId)
        if (allOrgApps.count >= appSize) {
            throw createError({
                message: `The number of apps has reached the limit ${appSize} apps`,
            })
        }
    }

    const now = new Date()
    await db.insert(tables.apps).values({
        id: generateId(),
        displayName: name,
        name: normalizeName(name),
        osType: osType,
        organizationsId: orgId,
        createdAt: now,
        updatedAt: now,
    })
    return {}
})
