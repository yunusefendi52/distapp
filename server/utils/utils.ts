export const normalizeName = (value: string): string => {
    return value.replaceAll(' ', '-')
}

export const JWT_KEY = process.env.JWT_KEY!
