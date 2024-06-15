import { addToOrg } from "../add-me-to-org.get"

export default defineEventHandler(async (event) => {
    const { link } = await readBody(event)
    const payload = await verifyToken(event, link)
    const orgId = payload.id
    if (!payload || !orgId) {
        throw createError({
            statusCode: 400,
            message: 'Invitation code expired or invalid',
        })
    }
    await addToOrg(event, orgId)
    return {
        message: 'added',
    }
})
