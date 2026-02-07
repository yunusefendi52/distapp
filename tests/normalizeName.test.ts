import { expect, test } from 'vitest'

test('Empty should throw error', () => {
    expect(() => normalizeName('')).toThrow()
})

test('Normalize name space to hypen', () => {
    expect(normalizeName('Org Test')).toEqual('org-test')
})

test('Normalize name multiple space to multiple hypen', () => {
    expect(normalizeName('Org  Test')).toEqual('org-test')
})

test('Should convert to lower case', () => {
    expect(normalizeName('ORGTEST')).toEqual('orgtest')
    expect(normalizeName('org-test     TEST')).toEqual('org-test-test')
    expect(normalizeName('org-test  test')).toEqual('org-test-test')
    expect(normalizeName('org-test--test')).toEqual('org-test-test')
    expect(normalizeName('org-test-test')).toEqual('org-test-test')
})

test('Should able to slugify non-latin character', () => {
    expect(normalizeName('Привет non-latin 你好')).toEqual('privet-non-latin')
    expect(normalizeName('你好 你好 你好')).toEqual('5l2g5aw9ios9oowlvsdkvadlpb0')
    expect(normalizeName('🚀 emoji')).toEqual('emoji')
    expect(normalizeName('🚀 emoji')).toEqual('emoji')
    expect(normalizeName('🚀-emoji')).toEqual('emoji')
})
