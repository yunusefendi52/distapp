import type { Discount } from "@polar-sh/sdk/models/components/discount.js"

export default defineEventHandler(async event => {
    if (!isBillingEnabled(event)) {
        return undefined
    }

    const discountId = getDiscountByUser(event.context.auth?.userId || '')
    if (!discountId) {
        return undefined
    }

    const polar = createPollar()
    const discount = await polar.discounts.get({
        id: discountId,
    })
    if (!validateIfDiscountValid(discount)) {
        return undefined;
    }

    const basisPoints: number = (discount as any).basisPoints || 0
    return {
        basisPoints: basisPoints,
        maxRedemptions: discount.maxRedemptions,
        startsAt: discount.startsAt,
        endsAt: discount.endsAt,
    }
})

export function validateIfDiscountValid(discount: Discount) {
    const now = new Date()
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    // Validate only if discount has expiry
    if (discount.endsAt && nowDate >= discount.endsAt) {
        return false
    }

    return true
}