import { expect, test } from 'vitest'

test('Empty should throw error', () => {
    expect(() => normalizeName('')).toThrow()
})

test('Normalize name space to hypen', () => {
    expect(normalizeName('Org Test')).toEqual('org-test')
})

test('Normalize name multiple space to multiple hypen', () => {
    expect(normalizeName('Org  Test')).toEqual('org--test')
})

test('Should convert to lower case', () => {
    expect(normalizeName('ORGTEST')).toEqual('orgtest')
})
