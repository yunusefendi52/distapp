import _ from "lodash"
import moment from "moment"

export const toOsType = (osType?: "android" | "ios" | null | undefined): OsType => {
    switch (osType) {
        case 'android':
            return 'android'
        default:
            return 'ios'
    }
}

export const getMimeTypeFromosType = (osType?: OsType): string => {
    return osType == 'android' ? 'application/vnd.android.package-archive,.aab' : '.ipa'
}

export type OsType = 'android' | 'ios'

export const getExtensionFromMimeType = (mimeType: string | undefined) => {
    if (mimeType === 'application/vnd.android.package-archive') {
        return 'apk'
    } else if (mimeType === 'application/x-authorware-bin') {
        return 'aab'
    } else if (mimeType === 'application/octet-stream') {
        return 'ipa'
    }
    return mimeType
}

export function formatBytes(bytes: number, decimals = 2, isBinary = false) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; // or ['B', 'KB', 'MB', 'GB', 'TB']

    if (!+bytes) {
        return `0 ${sizes[0]}`;
    }

    const inByte = isBinary ? 1024 : 1000;
    const dm = decimals < 0 ? 0 : decimals;

    const pow = Math.floor(Math.log(bytes) / Math.log(inByte));
    const maxPow = Math.min(pow, sizes.length - 1);

    return `${parseFloat((bytes / Math.pow(inByte, maxPow)).toFixed(dm))} ${sizes[maxPow]
        }`;
}

export const formatDate = (value?: string | null) => {
    return moment(value).format('LLL')
}

export const formatGroups = (groups: any[] | undefined) => {
    return groups && groups.length ? _.join(groups.map(e => e.artifactsGroups.name), ', ') : '-'
}