import { JWT_KEY } from '~/server/utils/utils'
import * as jose from 'jose'

const alg = 'HS256'

export default defineEventHandler(async (event) => {
    const token = await new jose.SignJWT({
        sub: 'b287aa5d85a040f78aa53a2ff7d53023',
    }).setProtectedHeader({ alg })
        .setIssuedAt()
        .sign(JWT_KEY)
    setCookie(event, 'app-auth', token, {
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
    })
    return {
        ok: true,
    }
})
