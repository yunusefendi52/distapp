import { v4 } from "uuid"
import type { AuthData } from "../middleware/auth-middleware"
import type { EventHandlerRequest, H3Event } from "h3"
import crypto from 'node:crypto'

export const normalizeName = (value: string): string => {
    return value.replaceAll(' ', '-')
}

export const getJwtKey = (event: H3Event<EventHandlerRequest>) => {
    const config = useRuntimeConfig(event)
    return new TextEncoder().encode(
        config.JWT_KEY,
    )
}

export const getStorageKeys = (auth: AuthData | string, key: String) => {
    const userId = typeof auth === 'string' ? auth : auth.userId
    return {
        temp: `temporary/userId-${userId}/${key}`,
        assets: `assets/userId-${userId}/${key}`,
    }
}

export const generateId = () => v4()

export const generateRandomPassword = (length = 60) => {
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let password = '';

    const array = new Uint32Array(chars.length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        password += chars[array[i] % chars.length];
    }
    return password
}


export const s3BucketName = 'distapp'
