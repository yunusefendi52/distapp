import { getJwtKey } from '../utils/utils';
import * as jose from 'jose'

export type AuthData = {
  userId: string,
}

declare module 'h3' {
  interface H3EventContext {
    auth: AuthData;
  }
}


export default defineEventHandler(async (event) => {
  const appAuth = getCookie(event, 'app-auth')
  if (appAuth) {
    try {
      const verifiedData = await jose.jwtVerify(appAuth, getJwtKey(event))
      if (!verifiedData) {
        deleteCookie(event, 'app-auth')
      } else {
        const userId = verifiedData.payload.sub
        event.context.auth = { userId: userId! }
      }
    }
    catch (e) {
      console.log(e)
      deleteCookie(event, 'app-auth')
    }
  } else {
    console.log('user not logged in')
  }
})
