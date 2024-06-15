import type { EventHandlerRequest, H3Event } from "h3"
import { organizationsPeople } from "../db/schema"

export default defineEventHandler(async (event) => {
    // const db = event.context.drizzle
    // const org = await db.query.organizations.findFirst()
    // await addMeToOrg(event, org!.id)
    return {}
})

export const addToOrg = async (event: H3Event<EventHandlerRequest>, orgId: string) => {
    const userId = event.context.auth.userId
    const db = event.context.drizzle
    console.log('request', { userId, orgId })
    await db.insert(organizationsPeople).values({
        organizationId: orgId,
        userId: userId,
        createdAt: new Date(),
        role: 'collaborator',
    })
}
