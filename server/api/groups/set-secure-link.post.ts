import { secureLinkMaxLength, secureLinkMinLength, secureLinkPattern } from "~/utils/secure-link"

export default defineEventHandler(async (event) => {
    const { orgName, appName, artifactGroupId, secureLink } = await readValidatedBody(event, z.object({
        orgName: z.string().max(256),
        appName: z.string().max(256),
        artifactGroupId: z.string().max(256),
        secureLink: z.string()
            .min(secureLinkMinLength, `Use at least ${secureLinkMinLength} characters`)
            .max(secureLinkMaxLength, `Use at most ${secureLinkMaxLength} characters`)
            .regex(secureLinkPattern, 'Only letters, numbers, dash and underscore are allowed'),
    }).parse)
    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }
    const { userApp } = await getUserApp(event, orgName, appName)
    const db = event.context.drizzle
    const groupWhere = and(
        eq(tables.artifactsGroups.id, artifactGroupId),
        eq(tables.artifactsGroups.appsId, userApp.id),
    )
    const group = await db.select()
        .from(tables.artifactsGroups)
        .where(groupWhere)
        .then(takeUniqueOrThrow)
    if (!group.isPublic) {
        throw createError({
            message: 'Secure link is only available for public groups',
            statusCode: 400,
        })
    }
    try {
        await db.update(tables.artifactsGroups).set({
            secureLink,
            updatedAt: new Date(),
        }).where(groupWhere)
    } catch (e) {
        const errorMessage = `${e}`
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            throw createError({
                message: 'That secure link is already taken',
                statusCode: 400,
            })
        }
        throw createError({
            message: errorMessage,
            statusCode: 400,
        })
    }
    return {
        secureLink,
    }
})
