import type { EventHandlerRequest, H3Event } from "h3"

export default defineEventHandler(async (event) => {
    // const db = event.context.drizzle
    // const org = await db.query.organizations.findFirst()
    // await addMeToOrg(event, org!.id)
    return {}
})

export const addToOrg = async (event: H3Event<EventHandlerRequest>, orgId: string, email: string) => {
    const db = event.context.drizzle
    const user = await db.select({
        userId: tables.users.id,
        email: tables.users.email,
    }).from(tables.users)
        .where(and(
            eq(tables.users.id, event.context.auth.userId),
            eq(tables.users.email, email),
        ))
        .get()
    if (!user) {
        throw createError({
            message: 'Thic code only valid for invited email only',
            statusCode: 400,
        })
    }
    await db.insert(tables.organizationsPeople).values({
        organizationId: orgId,
        userId: user.userId,
        createdAt: new Date(),
        role: 'collaborator',
    })
}
