import type { JoinTesterPayload } from "~/server/models/JoinTesterPayload"

export default defineEventHandler(async (event) => {
    var { orgName, appName, groupName, email } = await readValidatedBody(event, z.object({
        orgName: z.string().max(128),
        appName: z.string().max(128),
        groupName: z.string().max(128),
        email: z.string().email(),
    }).parse)
    email = email.trim()

    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }
    const { app: { apiAuthKey } } = useRuntimeConfig(event)
    const { userApp, userOrg } = await getUserApp(event, orgName, appName)
    const testerInviteLink = await generateTokenWithOptions(event, {
        email: email,
        orgName: userOrg.org!.name,
        orgId: userOrg.org!.id,
        appName: userApp.name,
        appId: userApp.id,
        groupName,
    } satisfies JoinTesterPayload, (v) => {
        return v.setExpirationTime('24 hour')
    }, apiAuthKey!)
    return {
        testerInviteLink,
    }
})
