import type { EventHandlerRequest, H3Event } from 'h3'
import * as jose from 'jose'

const alg = 'HS256'

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

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const state = query.state?.toString()!

    var signInProvider: string | undefined = undefined
    var jwtPayload: jose.JWTVerifyResult<jose.JWTPayload> | undefined = undefined

    // Verify state
    try {
        const verifiedData = await jose.jwtVerify(state, getJwtKey(event))
        if (!verifiedData) {
            setResponseStatus(event, 401, 'Not authorized')
            return
        }
        jwtPayload = verifiedData
        signInProvider = verifiedData.payload.sub!
    }
    catch (e) {
        setResponseStatus(event, 401, 'Not authorized 2')
        return
    }
    if (!signInProvider || !jwtPayload) {
        setResponseStatus(event, 401, 'Cannot be verified')
        return
    }

    var userId: string | undefined = undefined
    var userEmail: string | undefined = undefined
    var isAddAccount: boolean | undefined | null = undefined
    var userRealName = 'hmm'
    if (signInProvider === 'google') {
        const code = query.code?.toString()!
        const host = jwtPayload.payload.host as string
        isAddAccount = jwtPayload.payload.isAddAccount as (boolean | undefined | null)
        const { accessToken } = await getGoogleToken(event, host, code)
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        })
        if (!response.ok) {
            throw 'Cannot get user info'
        }
        const { id, email, name } = await response.json()
        userId = id
        userEmail = email
        userRealName = name
    }

    if (!userId || !userEmail) {
        setResponseStatus(event, 401, 'User does not have user id or email')
        return
    }
    const { token } = await generateUserToken(event, signInProvider, userId, userEmail, userRealName)
    if (!isAddAccount) {
        signInUser(event, token)
    }
    const param = new URLSearchParams({
        usr: token,
        e: userEmail,
    })
    await sendRedirect(event, `/?${param.toString()}`)
})

const getGoogleToken = async (event: H3Event<EventHandlerRequest>, host: string, code: string) => {
    const config = useRuntimeConfig(event)
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    const urlencoded = new URLSearchParams();
    urlencoded.append("code", code);
    urlencoded.append("client_secret", config.google.clientSecret);
    urlencoded.append("client_id", config.google.clientId);
    urlencoded.append("redirect_uri", `${host}${config.google.redirectUrl}`);
    urlencoded.append("grant_type", "authorization_code");

    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
    })
    if (!response.ok) {
        console.error('Error get google token', await response.text())
        throw 'Error get google token'
    }
    const json = await response.json()
    return {
        accessToken: json.access_token,
    }
}
