import { expect, test } from 'vitest'

test('Should pass validate filename', () => {
    expect(filenameRegex.test('release')).eq(true)
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
})
