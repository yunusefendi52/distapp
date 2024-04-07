import { getStorageKeys } from "~/server/utils/utils"

export default defineEventHandler(async (event) => {
    const prisma = event.context.prisma
    const { appName, orgName, releaseId } = getQuery(event)
    return await prisma.artifacts.findFirstOrThrow({
        include: {
            apps: true,
        },
        where: {
            releaseId: parseInt(releaseId?.toString() ?? ''),
            apps: {
                name: appName?.toString(),
                Organization: {
                    name: orgName?.toString(),
                    OrganizationsPeople: {
                        every: {
                            userId: event.context.auth.userId,
                        },
                    },
                },
            },
        },
    })
})
