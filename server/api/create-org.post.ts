import { count } from "drizzle-orm"
import { generateId } from "../utils/utils"

export default defineEventHandler(async (event) => {
    const userId = event.context.auth.userId
    const db = event.context.drizzle
    const { name: normalizedOrgName, displayName } = await readValidatedBody(event, z.object({
        name: z.string().min(1).max(128).trim().transform(normalizeName),
        displayName: z.string().min(1).max(128).trim(),
    }).parse)
    const now = new Date()
    if (process.env.IS_RUNNING_TEST !== '1') {
        const myCurrentUserOrgs = await db.select({
            count: count()
        }).from(tables.organizations)
            .leftJoin(tables.organizationsPeople, and(
                eq(tables.organizations.id, tables.organizationsPeople.organizationId),
                eq(tables.organizationsPeople.userId, userId),
                eq(tables.organizationsPeople.role, 'owner'),
            ))
            .then(takeUniqueOrThrow)
        const { APP_LIMIT_BETA_ORG } = useRuntimeConfig(event)
        if (myCurrentUserOrgs.count >= APP_LIMIT_BETA_ORG) {
            throw createError({
                message: `Currently we limited creating ${APP_LIMIT_BETA_ORG} organization as we are in beta testing`,
            })
        }
    }

    await db.transaction(async t => {
        const organizationId = generateId()
        await t.insert(tables.organizations).values({
            id: organizationId,
            name: normalizedOrgName,
            displayName: displayName,
            createdAt: now,
            updatedAt: now,
        })
        await t.insert(tables.organizationsPeople).values({
            userId: userId,
            organizationId: organizationId,
            createdAt: now,
            role: 'owner',
        })
    })
    return {
        normalizedOrgName: normalizedOrgName,
    }
})
