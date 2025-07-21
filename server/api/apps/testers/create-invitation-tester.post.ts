import type { JoinTesterPayload } from "~/server/models/JoinTesterPayload"
import { getListApikeys } from "./list-tester.get"

export default defineEventHandler(async (event) => {
    var { orgName, appName, groupName, email } = await readValidatedBody(event, z.object({
        orgName: z.string().max(128),
        appName: z.string().max(128),
        groupName: z.string().max(128),
        email: z.string().min(1).max(128),
    }).parse)
    email = email.trim()

    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }
    const { appConfig: { apiAuthKey } } = useRuntimeConfig(event)
    const { userApp, userOrg } = await getUserApp(event, orgName, appName)
    const testers = await getListApikeys(event, userApp.organizationsId!, userApp.id, groupName, 'count')
    const { APP_LIMIT_APPS_TESTER_GROUPS } = useRuntimeConfig(event)
    if (testers?.count! >= APP_LIMIT_APPS_TESTER_GROUPS) {
        throw createError({
            message: `The number of testers in group ${groupName} has reached the limit ${APP_LIMIT_APPS_TESTER_GROUPS} testers`,
        })
    }

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
