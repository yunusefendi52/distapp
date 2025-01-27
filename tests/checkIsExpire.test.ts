import { expect, test } from 'vitest'

test('Check if is expire', () => {
    expect(checkIsExpire(0, new Date())).equals(true)
    expect(checkIsExpire(1, new Date())).equals(false)
    const hourAgo = new Date()
    hourAgo.setHours(hourAgo.getHours() - 1)
    expect(checkIsExpire(0, hourAgo)).equals(true)
    const nextHour = new Date()
    nextHour.setHours(nextHour.getHours() + 1)
    expect(checkIsExpire(0, nextHour)).equals(false)

    expect(checkIsExpire(2, new Date())).equals(false)

    expect(checkIsExpire(1, nextHour)).equals(false)
    expect(checkIsExpire(2, nextHour)).equals(false)
    expect(checkIsExpire(72, nextHour)).equals(false)

    const twoHoursAgo = new Date()
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2)
    expect(checkIsExpire(3, twoHoursAgo)).equals(false)
    expect(checkIsExpire(2, twoHoursAgo)).equals(true)

    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    expect(checkIsExpire(120, nextMonth)).equals(false)
})
