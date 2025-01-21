import { isNull } from "drizzle-orm"
import type { EventHandlerRequest, H3Event } from "h3"
import * as jose from 'jose'
import { syncUserSubscription } from "../billing/subscription-sync"

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
    const name = payload['name'] as string
    const email = payload['email'] as string
    const { token: userToken, appUserId, pUserId } = await generateUserToken(event, 'google', payload.sub!, email, name)
    const userSubLms = await getUserSubscriptionLms(email)
    if (userSubLms) {
        const subAttrs = userSubLms.attributes
        await syncUserSubscription(event, appUserId, pUserId, userSubLms.id, {
            card_brand: subAttrs.card_brand || undefined,
            created_at: subAttrs.created_at,
            customer_id: subAttrs.customer_id,
            ends_at: subAttrs.ends_at,
            product_id: subAttrs.product_id,
            product_name: subAttrs.product_name,
            renews_at: subAttrs.renews_at,
            status: subAttrs.status,
            status_formatted: subAttrs.status_formatted,
            updated_at: subAttrs.updated_at,
            user_email: subAttrs.user_email,
            user_name: subAttrs.user_name,
            variant_id: subAttrs.variant_id,
            variant_name: subAttrs.variant_name,
        })
    }
    signInUser(event, userToken)
    const param = new URLSearchParams({
        usr: userToken,
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
        pUserId: userId,
        appUserId: appUserId,
    }
}

export const signInUser = (
    event: H3Event<EventHandlerRequest>,
    token: string) => {
    setCookie(event, cookieAuthKey, token, {
        httpOnly: false,
        secure: !import.meta.dev,
        sameSite: 'lax',
        maxAge: 34560000, // 365 days
    })
}
