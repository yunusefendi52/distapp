export default defineEventHandler(async event => {
    const user = await event.context.drizzle.select({
        id: tables.users.id,
        name: tables.users.name,
        email: tables.users.email,
    })
        .from(tables.users)
        .where(eq(tables.users.id, event.context.auth.userId))
        .then(takeUniqueOrThrow)
    return user
})