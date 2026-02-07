import { getListGroups } from "./list-groups.get"

export default defineEventHandler(async (event) => {
    const { appName, orgName, groupName, isPublic } = await readValidatedBody(event, z.object({
        appName: z.string().max(256),
        orgName: z.string().max(256),
        groupName: z.string().max(256),
        isPublic: z.boolean(),
    }).parse)
    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }
    const db = event.context.drizzle
    const { userApp: app } = await getUserApp(event, orgName, appName)
    const groups = await getListGroups(event, orgName, appName, undefined, 'count')
    const { appGroupLimit: appGroupSize } = await getUserFeature(event, app.organizationsId!)
    if (groups?.count! >= appGroupSize) {
        throw createError({
            message: `The number of groups has reached the limit of ${appGroupSize} groups`,
        })
    }
    const now = new Date()
    const normalizeGroupName = normalizeName(groupName)
    try {
        await db.insert(tables.artifactsGroups).values({
            id: generateId(),
            name: normalizeGroupName,
            displayName: groupName,
            appsId: app!.id,
            publicId: normalizeGroupName,
            isPublic: isPublic,
            createdAt: now,
            updatedAt: now,
        })
    } catch (e) {
        const errorMessage = `${e}`
        if (errorMessage.includes('SQLITE_CONSTRAINT') && errorMessage.includes('UNIQUE constraint failed:')) {
            throw createError({
                message: `${groupName} group with id "${normalizeGroupName}" already exists in your app. Try change or add prefix to your group name`,
                statusCode: 400,
            })
        } else {
            throw createError({
                message: errorMessage,
                statusCode: 400,
            })
        }
    }
    return {
        ok: true,
    }
})
