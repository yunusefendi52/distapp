export const secureLinkLength = 16
export const secureLinkMinLength = 6
export const secureLinkMaxLength = 32
export const secureLinkPattern = /^[A-Za-z0-9_-]+$/

const secureLinkCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export const generateSecureLink = (length = secureLinkLength) => {
    const array = new Uint32Array(length)
    crypto.getRandomValues(array)
    let value = ''
    for (let i = 0; i < length; i++) {
        value += secureLinkCharset[array[i]! % secureLinkCharset.length]
    }
    return value
}
