import { v4 } from "uuid"
import type { AuthData } from "../middleware/auth-middleware"

export const normalizeName = (value: string): string => {
    return value.replaceAll(' ', '-')
}

export const JWT_KEY = new TextEncoder().encode(
    '86969769fb6b4fb4a663d42ea05bf44a',
)

export const getStorageKeys = (auth: AuthData, key: String) => {
    return {
        temp: `temporary/userId-${auth.userId}/${key}`,
        assets: `assets/userId-${auth.userId}/${key}`,
    }
}

export const generateId = () => v4()
