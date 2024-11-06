import { isNull } from "drizzle-orm"
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

const generateUserToken = async (
    event: H3Event<EventHandlerRequest>,
    signInProvider: string,
    userId: string,
    userEmail: string,
    userRealName: string,
) => {
    userId = `${signInProvider}-${userId}`
    const db = event.context.drizzle
    const now = new Date()
    const appUserId = generateId()
    var user = await db.insert(tables.users).values({
        name: userRealName,
        id: appUserId,
        providerUserId: userId,
        email: userEmail,
        createdAt: now,
        updatedAt: now,
    }).onConflictDoUpdate({ // Remove onConflictDoUpdate to onConflictDoNothing once createdAt and updatedAt all tables non zero
        target: tables.users.providerUserId,
        setWhere: and(
            eq(tables.users.id, tables.users.providerUserId),
            isNull(tables.users.createdAt),
            isNull(tables.users.updatedAt),
        ),
        set: {
            id: appUserId,
            createdAt: now,
            updatedAt: now,
        },
    }).returning({ id: tables.users.id })
        .then(singleOrDefault)
    if (!user) {
        console.log('User returning null, maybe hits on conflict, try select again', userId)
        user = await db.select({
            id: tables.users.id,
        }).from(tables.users)
            .where(eq(tables.users.providerUserId, userId))
            .then(singleOrDefault)
    }
    if (!user) {
        const msg = 'User cannot be found or inserted'
        console.error(msg)
        throw createError({
            message: msg,
        })
    }
    const token = await new jose.SignJWT({
        sub: user.id,
        'email': userEmail,
        'provider': signInProvider,
    }).setProtectedHeader({ alg })
        .setIssuedAt()
        .sign(getJwtKey(event))
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
