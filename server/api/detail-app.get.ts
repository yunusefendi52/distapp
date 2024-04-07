export default defineEventHandler(async (event) => {
    const userId = event.context.auth.userId
    const prisma = event.context.prisma
    const { appName, orgName } = getQuery(event)
    const app = await prisma.apps.findFirstOrThrow({
        include: {
            Organization: true,
        },
        where: {
            name: appName!.toString(),
            Organization: {
                name: orgName!.toString(),
            },
        },
    })
    return app
})
