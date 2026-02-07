import { createClerkClient } from '@clerk/backend'
import { generateUserToken, signInUser } from './sign-in-google.post'

export default defineEventHandler(async event => {
    const {
        CLERK_SECRET_KEY,
        public: {
            CLERK_PUBLISHABLE_KEY,
        },
    } = useRuntimeConfig(event)
    if (!CLERK_PUBLISHABLE_KEY || !CLERK_SECRET_KEY) {
        throw createError({
            statusCode: 400,
            message: `Make sure you setup Clerk environment correctly`,
        })
    }

    const clerkClient = createClerkClient({
        secretKey: CLERK_SECRET_KEY,
        publishableKey: CLERK_PUBLISHABLE_KEY,
    })

    const req = toWebRequest(event)
    const { isAuthenticated, reason, toAuth } = await clerkClient.authenticateRequest(req)

    if (!isAuthenticated) {
        throw createError({
            statusCode: 401,
            message: `Cannot validate signin - ${reason}`,
        })
    }

    const authObject = toAuth()

    const userInfo = await clerkClient.users.getUser(authObject.userId)
    const userId = userInfo.id
    const userEmail = userInfo.primaryEmailAddress?.emailAddress!
    const userFullname = userInfo.fullName
    if (import.meta.dev) {
        console.log('userinfo', {
            sub: userId,
            email: userEmail,
            userFullname: userFullname,
        })
    }

    try {
        const { token: userToken } = await generateUserToken(event, 'email', userId, userEmail, userFullname || userEmail)

        signInUser(event, userToken)
        const param = new URLSearchParams({
            usr: userToken,
            e: userEmail,
        })
        return {
            param: param.toString(),
        }
    } catch (e) {
        if (`${e}`.includes('SQLITE_CONSTRAINT') && `${e}`.includes('users.email')) {
            throw createError({
                message: `User with email ${userEmail} already exists. Try with different email`,
                statusCode: 400,
            })
        } else {
            console.error('error signin', e)
            throw e
        }
    }
})
