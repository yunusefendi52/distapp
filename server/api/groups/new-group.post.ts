export default defineEventHandler(async (event) => {
    const { appName, orgName, groupName } = await readBody(event)
    const app = await event.context.prisma.apps.findFirstOrThrow({
        include: {
            Organization: true,
        },
        where: {
            name: appName,
            Organization: {
                name: orgName,
                OrganizationsPeople: {
                    every: {
                        userId: event.context.auth.userId,
                    },
                },
            },
        },
    })
    await event.context.prisma.artifactsGroups.create({
        data: {
            name: normalizeName(groupName),
            appsId: app.id,
        }
    })
    return {
        ok: true,
    }
})
