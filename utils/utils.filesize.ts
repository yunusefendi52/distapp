import { filesize } from "filesize";

export function formatBytes(bytes: number | null | undefined, decimals = 2, isBinary = false) {
    if (!bytes) {
        return undefined
    }
    return filesize(bytes)
}
