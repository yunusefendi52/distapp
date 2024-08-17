export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    await db.insert(tables.users).values({
        name: 'User 1',
        id: event.context.auth.userId,
    }).onConflictDoNothing()
    return {
        ok: true,
    }
})
