import { users } from "../db/schema"
import { generateId } from "../utils/utils"

export default defineEventHandler(async (event) => {
    const db = event.context.drizzle
    await db.insert(users).values({
        name: 'User 1',
        id: event.context.auth.userId,
    })
    return {
        ok: true,
    }
})
