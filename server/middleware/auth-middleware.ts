import { JWT_KEY } from '../utils/utils';

export type AuthData = {
  userId: string,
}

declare module 'h3' {
  interface H3EventContext {
    auth: AuthData;
  }
}


export default defineEventHandler((event) => {
  event.context.auth = { userId: '8551be3fcf41470b806a6334d24396d6' }
})
