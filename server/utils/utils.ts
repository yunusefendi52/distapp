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

export const getStorageKeys = (auth: AuthData, key: String) => {
    return {
        temp: `temporary/userId-${auth.userId}/${key}`,
        assets: `assets/userId-${auth.userId}/${key}`,
    }
}

export const generateId = () => v4()

export const generateRandomPassword = () => {
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let pwordLength = 60;
    let password = '';

    const array = new Uint32Array(chars.length);
    crypto.getRandomValues(array);

    for (let i = 0; i < pwordLength; i++) {
        password += chars[array[i] % chars.length];
    }
    return password
}


export const s3BucketName = 'distapp'
