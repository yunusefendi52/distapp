import slugify from 'slugify'

export const normalizeName = (value) => {
    const slugValue = slugify(value.trim(), {
        lower: true,
        locale: 'en',
        replacement: '-',
        trim: true,
    })
    if (!slugValue.length) {
        throw 'Value cannot be empty or whitespace'
    }
    return slugValue
}

export default {
    normalizeName,
}