import _ from 'lodash'

export default defineEventHandler(async (event) => {
    const userId = event.context.auth.userId
    const prisma = event.context.prisma
    const request = await readBody(event)
    const userOrg = await prisma.organizations.findFirstOrThrow({
        include: {
            OrganizationsPeople: true,
        },
        where: {
            OrganizationsPeople: {
                every: {
                    userId: userId,
                },
            },
        },
    })
    await prisma.apps.create({
        data: {
            displayName: request.name,
            name: normalizeName(request.name),
            osType: request.osType,
            organizationsId: request.orgId,
        },
    })
    return {}
})
