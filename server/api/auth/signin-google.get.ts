import { Auth } from 'googleapis'
import * as jose from 'jose'
import { createGoogleOAuth } from '~/server/utils/utils'

const alg = 'HS256'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const host = query.host?.toString()!
    const config = useRuntimeConfig(event)
    
    const exp = new Date();
    exp.setMinutes(exp.getMinutes() + 1)
    const token = await new jose.SignJWT({
        sub: 'google',
        'host': host,
    }).setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime(exp)
        .sign(getJwtKey(event))

    const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid&access_type=offline&include_granted_scopes=true&response_type=code&state=${token}&redirect_uri=${host}${config.google.redirectUrl}&client_id=${config.google.clientId}`
    await sendRedirect(event, authorizationUrl)
})
