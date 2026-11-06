export const getInitials = (name?: string | null, count = 1) => {
    const words = name?.trim().split(/\s+/).filter(Boolean) ?? []
    if (!words.length) return '?'
    return words.slice(0, count).map(word => Array.from(word)[0]).join('').toUpperCase()
}
