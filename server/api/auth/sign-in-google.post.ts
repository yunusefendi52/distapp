import type { EventHandlerRequest, H3Event } from "h3"
import * as jose from 'jose'

const alg = 'HS256'

export default defineEventHandler(async event => {
    const { token } = await readValidatedBody(event, z.object({
        token: z.string().min(1)
    }).parse)
    const { GOOGLE_CLIENT_ID } = useRuntimeConfig().public
    const payload = await verifyGoogleIdToken({
        idToken: token,
        clientId: GOOGLE_CLIENT_ID,
    })
    if (!payload) {
        throw createError({
            message: 'Invalid payload sign in google',
        })
    }
    const userId = payload.sub!
    const name = payload['name'] as string
    const email = payload['email'] as string
    const { token: userToken } = await generateUserToken(event, 'google', userId, email, name)
    signInUser(event, userToken)
    const param = new URLSearchParams({
        usr: token,
        e: email,
    })
    return {
        param: param.toString(),
    }
})

export const generateUserToken = async (
    event: H3Event<EventHandlerRequest>,
    signInProvider: string,
    userId: string,
    userEmail: string,
    userRealName: string,
) => {
    userId = `${signInProvider}-${userId}`
    const token = await new jose.SignJWT({
        sub: userId,
        'email': userEmail,
        'provider': signInProvider,
    }).setProtectedHeader({ alg })
        .setIssuedAt()
        .sign(getJwtKey(event))
    const db = event.context.drizzle
    await db.insert(tables.users).values({
        name: userRealName,
        id: userId,
        email: userEmail,
    }).onConflictDoNothing()
    return {
        token,
    }
}

export const signInUser = (
    event: H3Event<EventHandlerRequest>,
    token: string) => {
    setCookie(event, 'app-auth', token, {
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
    })
}
