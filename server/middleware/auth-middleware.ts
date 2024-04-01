import jsonwebtoken from 'jsonwebtoken'
import { JWT_KEY } from '../utils/utils';

type AuthData = {
  userId: number,
}

declare module 'h3' {
  interface H3EventContext {
    auth: AuthData;
  }
}


export default defineEventHandler((event) => {
  const appAuth = getCookie(event, 'app-auth')
  if (appAuth) {
    const verifiedData = jsonwebtoken.verify(appAuth, JWT_KEY)
    // if (!verifiedData) {
    //   deleteCookie(event, 'app-auth')
    // }
    // @ts-ignore
    const userId = verifiedData.userId
    event.context.auth = { userId: userId }
  } else {
    console.log('user not logged in')
    event.context.auth = { userId: 1 }
  }
})
