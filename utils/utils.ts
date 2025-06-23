import * as jose from 'jose'

export const getAllowedExtsFromOstype = (osType?: OsType): string => {
    if (osType === 'android') return '.apk,.aab'
    else if (osType === 'ios') return '.ipa'
    else if (osType === 'desktop') return '.zip'
    return ''
}

export type OsType = 'android' | 'ios' | 'desktop'

export async function isZipFile(file: File | Buffer): Promise<boolean> {
    const ZIP_SIGNATURE = [0x50, 0x4B, 0x03, 0x04]; // "PK\x03\x04"

    let header: Uint8Array;

    if (file instanceof File) {
        if (file.size < 4) return false;
        const buffer = await file.slice(0, 4).arrayBuffer();
        header = new Uint8Array(buffer);
    } else if (Buffer.isBuffer(file)) {
        if (file.length < 4) return false;
        header = new Uint8Array(file.slice(0, 4));
    } else {
        throw new TypeError("Unsupported file type");
    }

    return ZIP_SIGNATURE.every((byte, i) => header[i] === byte);
}

export function formatBytes(bytes: number | null | undefined, decimals = 2, isBinary = false) {
    if (!bytes) {
        return undefined
    }
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
    return value ? formatRelativeTime(new Date(value)) : '-'
}

function formatRelativeTime(date: Date, baseDate = Date.now()) {
    const rtf = new Intl.RelativeTimeFormat(undefined, {
        numeric: 'auto',
        style: 'long',
    });
    const d1 = new Date(baseDate);
    const d2 = new Date(date);
    const diffInSeconds = Math.floor((d2.getTime() - d1.getTime()) / 1000);

    const units = [
        { unit: 'year', seconds: 60 * 60 * 24 * 365 },
        { unit: 'month', seconds: 60 * 60 * 24 * 30 },
        { unit: 'week', seconds: 60 * 60 * 24 * 7 },
        { unit: 'day', seconds: 60 * 60 * 24 },
        { unit: 'hour', seconds: 60 * 60 },
        { unit: 'minute', seconds: 60 },
        { unit: 'second', seconds: 1 },
    ];

    for (const { unit, seconds } of units) {
        const delta = diffInSeconds / seconds;
        if (Math.abs(delta) >= 1 || unit === 'second') {
            return rtf.format(Math.round(delta), unit as any);
        }
    }
}

export const isIosDevice = () => /(iPad|iPhone|iPod)/g.test(navigator.userAgent) || (/(Mac OS)/g.test(navigator.userAgent) && "ontouchend" in document)

export const generateManifestLink = (manifestData: any, orgName: string, appName: string, releaseId: string, publicLink: string | undefined) => {
    const data = {
        ...manifestData,
        orgName,
        appName,
        releaseId,
        publicLink,
    }
    const dataStr = btoa(JSON.stringify(data))
    const dd = encodeURIComponent(`?data=${dataStr}`)
    return `itms-services://?action=download-manifest&url=${window.location.origin}/api/manifest.plist${dd}`
}

export const decodeJwt = (value: string) => {
    return jose.decodeJwt(value)
}

export type { MenuItem, MenuItemCommandEvent } from 'primevue/menuitem'
import type { MenuItemCommandEvent } from 'primevue/menuitem'

export const navigateFromTab = (event: MenuItemCommandEvent) => {
    navigateTo({
        name: event.item.routeName,
        params: event.item.routeParams,
    })
}

export function formatSimpleDate(value: string | undefined) {
    return value ? new Intl.DateTimeFormat(undefined, {
        dateStyle: 'long',
        timeStyle: 'medium',
    }).format(new Date(value)) : '-'
}
