export default defineEventHandler(async ({ context }) => {
    const userId = context.auth.userId
    const org = await context.prisma.organizations.findFirstOrThrow()
    await context.prisma.organizationsPeople.create({
        data: {
            organizationId: org.id,
            userId: userId,
        },
    })
    return {}
})
