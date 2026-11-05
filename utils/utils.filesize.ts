import { filesize } from "filesize";

export function formatBytes(bytes: number | null | undefined, decimals = 2, isBinary = false) {
    if (!bytes) {
        return undefined
    }
    if (isBinary) {
        return filesize(bytes, { base: 2, standard: 'jedec', round: decimals })
    }
    return filesize(bytes)
}
