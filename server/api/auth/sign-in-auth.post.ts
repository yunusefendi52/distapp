import { isNull } from "drizzle-orm"
import type { EventHandlerRequest, H3Event } from "h3"
import * as jose from 'jose'
import { generateUserToken, signInUser } from "./sign-in-google.post"

const alg = 'HS256'

export default defineEventHandler(async event => {
    const { username, password } = await readValidatedBody(event, z.object({
        username: z.string().min(1),
        password: z.string().min(1),
    }).parse)
    const localAuths = getLocalAuths(useRuntimeConfig(event).LOCAL_AUTHS)
    const localAuthed = localAuths.find(e => e.username === username && e.password === password)
    if (!localAuthed) {
        throw createError({
            message: 'Invalid local auth',
            statusCode: 400,
        })
    }
    const { token: userToken } = await generateUserToken(event, 'localauth', localAuthed.username, localAuthed.username, localAuthed.username)
    signInUser(event, userToken)
    const param = new URLSearchParams({
        usr: userToken,
        e: localAuthed.username,
    })
    return {
        param: param.toString(),
    }
})

export function getLocalAuths(localAuths: string): { username: string, password: string }[] {
    return localAuths.split(';').map(e => {
        const s = e.split('=')
        return {
            username: s[0],
            password: s[1],
        }
    })
}
