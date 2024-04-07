export const toOsType = (osType?: "android" | "ios" | null | undefined): OsType => {
    switch (osType) {
        case 'android':
            return 'android'
        default:
            return 'ios'
    }
}

export const getMimeTypeFromosType = (osType?: OsType): string => {
    return osType == 'android' ?'application/vnd.android.package-archive' : 'application/octet-stream'
}

export type OsType = 'android' | 'ios'