export const toOsType = (osType?: number): OsType => {
    switch (osType) {
        case 0:
            return 'android'
        default:
            return 'ios'
    }
}

export const getMimeTypeFromosType = (osType?: OsType): string => {
    return osType == 'android' ?'application/vnd.android.package-archive' : 'application/octet-stream'
}

export type OsType = 'android' | 'ios'