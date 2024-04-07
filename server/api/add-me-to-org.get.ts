import { organizationsPeople } from "../db/schema"

export default defineEventHandler(async ({ context }) => {
    const userId = context.auth.userId
    const db = context.drizzle
    const org = await db.query.organizations.findFirst()
    await db.insert(organizationsPeople).values({
        organizationId: org!.id,
        userId: userId,
    })
    return {}
})
