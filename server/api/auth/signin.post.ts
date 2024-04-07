import jsonwebtoken from 'jsonwebtoken'
import { JWT_KEY } from '~/server/utils/utils'

export default defineEventHandler(async (event) => {
    const token = jsonwebtoken.sign({
        name: 'Yunus',
        userId: 1,
    }, JWT_KEY, {})
    setCookie(event, 'app-auth', token, {
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
    })
    return {
        ok: true,
    }
})
