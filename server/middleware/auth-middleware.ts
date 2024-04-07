import { JWT_KEY } from '../utils/utils';
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
    const verifiedData = await jose.jwtVerify(appAuth, JWT_KEY)
    if (!verifiedData) {
      deleteCookie(event, 'app-auth')
    } else {
      const userId = verifiedData.payload.sub
      event.context.auth = { userId: userId! }
    }
  } else {
    console.log('user not logged in')
  }
})
