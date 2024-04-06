import type { AuthData } from "~/server-api/src/models"

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

export const toOsType = (osType?: number): OsType => {
    switch (osType) {
        case 0:
            return 'android'
        default:
            return 'ios'
    }
}

export const getMimeTypeFromosType = (osType?: OsType): string => {
    return osType == 'android' ? 'application/vnd.android.package-archive' : 'application/octet-stream'
}

export type OsType = 'android' | 'ios'
