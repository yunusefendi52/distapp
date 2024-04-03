import type { AuthData } from "../middleware/auth-middleware"

export const normalizeName = (value: string): string => {
    return value.replaceAll(' ', '-')
}

export const JWT_KEY = process.env.JWT_KEY!

export const getStorageKeys = (auth: AuthData, key: String) => {
    return {
        temp: `temporary/userId-${auth.userId}/${key}`,
        assets: `assets/userId-${auth.userId}/${key}`,
    }
}
