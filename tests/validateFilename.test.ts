import { expect, test } from 'vitest'

test('Should pass validate filename', () => {
    expect(filenameRegex.test('release')).toBe(true)
    expect(filenameRegex.test('Release#Copy')).toBe(false)
    expect(filenameRegex.test('release copy')).toBe(true)
    expect(filenameRegex.test('Release Copy')).toBe(true)
    expect(filenameRegex.test('Release')).toBe(true)
    expect(filenameRegex.test('IPA Release')).toBe(true)
    expect(filenameRegex.test('IPA Release v1.0.0')).toBe(true)
    expect(filenameRegex.test('IPA Release v1.0.0+1')).toBe(true)
    expect(filenameRegex.test('APK Release v1.0.0+1')).toBe(true)
    expect(filenameRegex.test('APK-Release-v1.0.0+1')).toBe(true)
    expect(filenameRegex.test('APK_Release_v1.0.0+1')).toBe(true)
    expect(filenameRegex.test('APK_Release_v1.0.0+1 (build1)')).toBe(true)
    expect(filenameRegex.test('APK_Release_v1.0.0+1 (8c8f1f3d)')).toBe(true)
    expect(filenameRegex.test('APK_Release_v1.0.0+1 (8c8f1f3d).file.apk')).toBe(true)

    // Alphanumeric characters
    expect(filenameRegex.test('a')).toBe(true)
    expect(filenameRegex.test('A')).toBe(true)
    expect(filenameRegex.test('1234567890')).toBe(true)
    expect(filenameRegex.test('Release123')).toBe(true)
    expect(filenameRegex.test('123Release')).toBe(true)

    // Allowed special characters
    expect(filenameRegex.test('file.name')).toBe(true)
    expect(filenameRegex.test('file_name')).toBe(true)
    expect(filenameRegex.test('file-name')).toBe(true)
    expect(filenameRegex.test('file+name')).toBe(true)
    expect(filenameRegex.test('file(name)')).toBe(true)
    expect(filenameRegex.test('(file)')).toBe(true)
    expect(filenameRegex.test('file (copy)')).toBe(true)
    expect(filenameRegex.test('file...name')).toBe(true)
    expect(filenameRegex.test('file__name')).toBe(true)
    expect(filenameRegex.test('file--name')).toBe(true)

    // Multiple allowed special characters
    expect(filenameRegex.test('file_name-v1.0+1')).toBe(true)
    expect(filenameRegex.test('file.name_v1-0+1 (copy)')).toBe(true)
    expect(filenameRegex.test('APK_Release-v1.0.0+1 (build1).apk')).toBe(true)

    // Whitespace
    expect(filenameRegex.test('file name')).toBe(true)
    expect(filenameRegex.test(' file')).toBe(true)
    expect(filenameRegex.test('file ')).toBe(true)
    expect(filenameRegex.test('file  name')).toBe(true)

    // Unsupported special characters
    expect(filenameRegex.test('Release#Copy')).toBe(false)
    expect(filenameRegex.test('Release@Copy')).toBe(false)
    expect(filenameRegex.test('Release:Copy')).toBe(false)
    expect(filenameRegex.test('Release*Copy')).toBe(false)
    expect(filenameRegex.test('Release?Copy')).toBe(false)
    expect(filenameRegex.test('Release/Copy')).toBe(false)
    expect(filenameRegex.test('Release\\Copy')).toBe(false)
    expect(filenameRegex.test('Release|Copy')).toBe(false)
    expect(filenameRegex.test('Release<Copy>')).toBe(false)
    expect(filenameRegex.test('Release"Copy"')).toBe(false)
    expect(filenameRegex.test('Release=Copy')).toBe(false)
    expect(filenameRegex.test('Release,Copy')).toBe(false)
    expect(filenameRegex.test('Release;Copy')).toBe(false)
    expect(filenameRegex.test('Release%Copy')).toBe(false)
    expect(filenameRegex.test('Release^Copy')).toBe(false)
    expect(filenameRegex.test('Release&Copy')).toBe(false)
    expect(filenameRegex.test('Release!Copy')).toBe(false)
    expect(filenameRegex.test('Release~Copy')).toBe(false)
    expect(filenameRegex.test('Release`Copy')).toBe(false)
    expect(filenameRegex.test('Release[Copy]')).toBe(false)
    expect(filenameRegex.test('Release{Copy}')).toBe(false)

    // Empty filename
    expect(filenameRegex.test('')).toBe(false)

    // Filename length boundaries
    expect(filenameRegex.test('a'.repeat(1))).toBe(true)
    expect(filenameRegex.test('a'.repeat(254))).toBe(true)
    expect(filenameRegex.test('a'.repeat(255))).toBe(true)
    expect(filenameRegex.test('a'.repeat(256))).toBe(false)

    // Length with realistic filename characters
    expect(filenameRegex.test(`${'A'.repeat(250)}.apk`)).toBe(true)
    expect(filenameRegex.test(`${'A'.repeat(252)}.apk`)).toBe(false)
})
