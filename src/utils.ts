import { v4 } from "uuid"
import { AuthData } from "./models"

export const normalizeName = (value: string): string => {
    return value.replaceAll(' ', '-')
}

export const getStorageKeys = (auth: AuthData, key: String | string) => {
    return {
        temp: `temporary/userId-${auth.userId}/${key}`,
        assets: `assets/userId-${auth.userId}/${key}`,
    }
}

export const generateId = () => v4()
