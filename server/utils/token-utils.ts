import type { EventHandlerRequest, H3Event } from 'h3'
import * as jose from 'jose'
import Crypto from 'crypto-js'

const alg = 'HS256'

type GenerateJwtConfig = (jwtOptions: jose.SignJWT) => jose.SignJWT

export const generateToken = (
    event: H3Event<EventHandlerRequest>,
    data: any) => {
    return generateTokenWithOptions(event, data, (v) => v)
}

export const generateTokenWithOptions = async (
    event: H3Event<EventHandlerRequest>,
    data: any,
    configJwt: GenerateJwtConfig) => {
    const jwtOptions = new jose.SignJWT(data).setProtectedHeader({ alg })
        .setIssuedAt()
    configJwt(jwtOptions)
    const token = await
        jwtOptions.sign(getJwtKey(event))
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

export const encryptText = (
    event: H3Event<EventHandlerRequest>,
    data: any) => {
    const config = useRuntimeConfig(event)
    return Crypto.AES.encrypt(JSON.stringify(data), config.JWT_KEY).toString()
}

export const decryptText = (
    event: H3Event<EventHandlerRequest>,
    token: string) => {
    const config = useRuntimeConfig(event)
    config.JWT_KEY
    const value = Crypto.AES.decrypt(token, config.JWT_KEY).toString(Crypto.enc.Utf8)
    return JSON.parse(value)
}
