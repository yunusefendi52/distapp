import { getJwtKey } from '../utils/utils';
import * as jose from 'jose'

export type AuthData = {
  userId: string,
  email: string | undefined,
}

declare module 'h3' {
  interface H3EventContext {
    auth: AuthData;
  }
}


export default defineEventHandler(async (event) => {
  if (event.path === '/healthcheck') {
    return
  }
  const appAuth = getCookie(event, cookieAuthKey)
  if (appAuth) {
    try {
      const verifiedData = await jose.jwtVerify(appAuth, getJwtKey(event))
      if (!verifiedData) {
        deleteCookie(event, cookieAuthKey)
      } else {
        const userId = verifiedData.payload.sub
        const email = verifiedData.payload.email as string | undefined
        event.context.auth = {
          userId: userId!,
          email: email,
        }
      }
    }
    catch (e: any) {
      console.error(e)
      deleteCookie(event, cookieAuthKey)
      if (e.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
        console.warn('Failed to verify jwt in auth, different key?')
        const path = event.path
        if (path !== '/') {
          await sendRedirect(event, '/')
        }
      }
    }
  } else {
    console.log('user not logged in')
  }
})
