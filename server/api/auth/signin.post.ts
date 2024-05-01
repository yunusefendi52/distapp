import { generateUserToken, signInUser } from './callback.get'
const alg = 'HS256'

export default defineEventHandler(async (event) => {
    const { key } = await readBody(event)
    const config = useRuntimeConfig(event)
    if (key !== config.adminKey.key) {
        return setResponseStatus(event, 401)
    }

    const { token } = await generateUserToken(event, 'admin', '8ba3c4aa500f4c1e8ba84991960454c4', 'admin@admin.com', 'Admin')
    signInUser(event, token)
    return {
        ok: true,
    }
})
