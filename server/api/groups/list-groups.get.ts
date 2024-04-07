export default defineEventHandler(async (event) => {
    const { appName, orgName } = getQuery(event)
    const groups = await event.context.prisma.artifactsGroups.findMany({
        // include: {
        //     apps: true,
        // },
        where: {
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
            }
        }
    })
    return groups
})
