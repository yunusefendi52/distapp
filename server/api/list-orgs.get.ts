export default defineEventHandler(async (event) => {
    const userId = event.context.auth.userId
    const prisma = event.context.prisma
    const orgs = await prisma.organizations.findMany({
        where: {
            OrganizationsPeople: {
                every: {
                    userId: userId,
                },
            },
        },
    })
    return orgs
})
