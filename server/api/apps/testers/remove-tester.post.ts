import type { JoinTesterPayload } from "~/server/models/JoinTesterPayload"

export default defineEventHandler(async (event) => {
    var { orgName, appName, groupName, userId } = await readValidatedBody(event, z.object({
        orgName: z.string().max(128),
        appName: z.string().max(128),
        groupName: z.string().max(128),
        userId: z.string().min(1),
    }).parse)

    if (await roleEditNotAllowed(event, orgName)) {
        throw createError({
            message: 'Unauthorized',
            statusCode: 401,
        })
    }
    const { userApp, userOrg } = await getUserApp(event, orgName, appName)
    const db = event.context.drizzle
    const artifactGroup = await db.select({
        groupId: tables.artifactsGroups.id,
    }).from(tables.artifactsGroups)
        .where(eq(tables.artifactsGroups.name, groupName))
        .then(takeUniqueOrThrow)
    await db.delete(tables.groupTester)
        .where(and(
            eq(tables.groupTester.testerId, userId),
            eq(tables.groupTester.organizationId, userOrg.org!.id),
            eq(tables.groupTester.appsId, userApp.id),
            eq(tables.groupTester.artifactGroupId, artifactGroup.groupId),
        ))
    return {
        ok: true,
    }
})
