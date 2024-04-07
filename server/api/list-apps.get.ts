export default defineEventHandler(async (event) => {
    const userId = event.context.auth.userId
    const prisma = event.context.prisma
    const { search, orgName } = getQuery<ListAppsRequest>(event)
    const userOrgs = await prisma.organizations.findMany({
        include: {
            OrganizationsPeople: true,
        },
        where: {
            OrganizationsPeople: {
                every: {
                    userId: userId,
                    organization: {
                        name: orgName,
                    },
                },
            },
        },
    })
    const apps = await prisma.apps.findMany({
        include: {
            Organization: true,
        },
        where: {
            OR: userOrgs.map(e => e.id).map(e => ({
                organizationsId: e,
            })),
            displayName: {
                contains: search,
            },
        },
        orderBy: {
            name: 'asc',
        },
    })
    return apps
})

export interface ListAppsRequest {
    search?: string
    orgName?: string
}
