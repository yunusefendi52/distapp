import { v4 } from "uuid"
import type { AuthData } from "../middleware/auth-middleware"

export const normalizeName = (value: string): string => {
    return value.replaceAll(' ', '-')
}

export const JWT_KEY = '5cc673bc5f4c44069fa633b582f0ccf2'

export const getStorageKeys = (auth: AuthData, key: String) => {
    return {
        temp: `temporary/userId-${auth.userId}/${key}`,
        assets: `assets/userId-${auth.userId}/${key}`,
    }
}

export const generateId = () => v4()
