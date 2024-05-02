import type { EventHandlerRequest, H3Event } from 'h3'
import * as jose from 'jose'

const alg = 'HS256'

export const generateToken = async (
    event: H3Event<EventHandlerRequest>,
    data: any) => {
    const token = await new jose.SignJWT(data).setProtectedHeader({ alg })
        .setIssuedAt()
        .sign(getJwtKey(event))
    return token
}

export const verifyToken = async (
    event: H3Event<EventHandlerRequest>,
    token: string): Promise<any> => {
    try {
        const data = await jose.jwtVerify(token, getJwtKey(event))
        return data.payload
    } catch {
        return undefined
    }
}
