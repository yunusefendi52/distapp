import { JWT_KEY } from '~/server/utils/utils'

export default defineEventHandler(async (event) => {
    // const token = await new jose.SignJWT({
    //     name: 'Yunus',
    //     userId: 'b287aa5d85a040f78aa53a2ff7d53023'
    // }).sign(JWT_KEY)
    // // const token = jose.sign({
    // //     name: 'Yunus',
    // //     userId: 1,
    // // }, JWT_KEY, {})
    // setCookie(event, 'app-auth', token, {
    //     httpOnly: false,
    //     secure: true,
    //     sameSite: 'lax',
    // })
    return {
        ok: true,
    }
})
