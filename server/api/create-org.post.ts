export default defineEventHandler(async (event) => {
    const userId = event.context.auth.userId
    const prisma = event.context.prisma
    const { name, displayName } = await readBody(event)
    await prisma.$transaction(async (tx) => {
        const org = await tx.organizations.create({
            data: {
                name: normalizeName(name),
                displayName: displayName,
            },
        })
        await tx.organizationsPeople.create({
            data: {
                userId: userId,
                organizationId: org.id,
            },
        })
    })
    return { ok: true }
})
