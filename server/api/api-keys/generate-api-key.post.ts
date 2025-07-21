import { uuidv4 } from "uuidv7"
import { getListApikeys } from "./list-api-keys.get"

export default defineEventHandler(async (event) => {
    const { appConfig: { apiAuthKey } } = useRuntimeConfig(event)
    if (!apiAuthKey) {
        throw createError({
            message: 'Please provide using env NUXT_APP_CONFIG_API_AUTH_KEY',
            statusCode: 500,
        })
    }

    if (!event.context.auth.userId) {
        setResponseStatus(event, 401, 'Unauthorized')
        return
    }

    const { orgName, appName } = await readValidatedBody(event, z.object({
        appName: z.string().trim().min(1).max(128),
        orgName: z.string().trim().min(1).max(128),
    }).parse)

    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }

    const db = event.context.drizzle
    const { userApp, userOrg } = await getUserApp(event, orgName, appName)
    const listApiKeys = await getListApikeys(event, userApp.name, userOrg.org!.name, 'count')
    const { APP_LIMIT_API_KEYS } = useRuntimeConfig(event)
    if (listApiKeys?.count! >= APP_LIMIT_API_KEYS) {
        throw createError({
            message: `You can only create ${APP_LIMIT_API_KEYS} keys. Delete your other keys`,
        })
    }

    const id = uuidv4()
    const token = await generateTokenWithOptions(event, {
        id,
    } satisfies ApiKeyTypePayload, v => v, apiAuthKey)
    await db.insert(tables.apiKeys).values({
        id: id,
        createdAt: new Date(),
        appsId: userApp.id,
        organizationId: userOrg.org!.id,
    })

    return {
        token: token,
    }
})

export type ApiKeyTypePayload = {
    id: string,
}
