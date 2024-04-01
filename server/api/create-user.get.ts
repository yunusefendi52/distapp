export default defineEventHandler(async (event) => {
    const prisma = event.context.prisma
    await prisma.user.create({
        data: {
            name: 'User 1'
        }
    })
    return {}
})
