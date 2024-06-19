import { uuidv7 } from "uuidv7"
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

export const getStorageKeys = (orgId: string, appId: string, key: string) => {
    return {
        temp: `temporary/orgid-${orgId}-${appId}/${key}`,
        assets: `assets/orgid-${orgId}-${appId}/${key}`,
    }
}

export const generateId = () => uuidv7()

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

export const userTokensKey = 'usr-k'
export const userTokensHeaderKey = 'usr-k-sv'
