import type { JoinTesterPayload } from "~/server/models/JoinTesterPayload"

export default defineEventHandler(async (event) => {
    const { token } = await readValidatedBody(event, z.object({
        token: z.string().min(1),
    }).parse)

    const { app: { apiAuthKey } } = useRuntimeConfig(event)
    const joinTesterPayload = await verifyToken(event, token, apiAuthKey) as JoinTesterPayload

    const auth = event.context.auth
    if (joinTesterPayload.email !== auth.email) {
        throw createError({
            message: 'Join invitation not found, make sure you have the correct account',
            statusCode: 400,
        })
    }

    const db = event.context.drizzle
    const [userTester, artifactGroup] = await Promise.all([
        db.select({
            userId: tables.users.id,
        }).from(tables.users)
            .where(eq(tables.users.email, joinTesterPayload.email))
            .then(takeUniqueOrThrow),
        db.select({
            groupId: tables.artifactsGroups.id,
        }).from(tables.artifactsGroups)
            .where(and(
                eq(tables.artifactsGroups.name, joinTesterPayload.groupName),
                eq(tables.artifactsGroups.appsId, joinTesterPayload.appId),
            ))
            .then(takeUniqueOrThrow)
    ])
    await db.insert(tables.groupTester)
        .values({
            id: generateId(),
            testerId: userTester.userId,
            artifactGroupId: artifactGroup.groupId,
            appsId: joinTesterPayload.appId,
            organizationId: joinTesterPayload.orgId,
        })
        .onConflictDoNothing()
    return {
        orgName: joinTesterPayload.orgName,
        appName: joinTesterPayload.appName,
        groupName: joinTesterPayload.groupName,
    }
})
