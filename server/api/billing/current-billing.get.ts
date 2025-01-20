import { defineEventHandler } from 'h3'

export default defineEventHandler(async event => {
    const productPlan = await getProductPlan()
    var userSub = await getUserSubFromDb(event)
    // https://github.com/lmsqueezy/lemonsqueezy.js/blob/b1f66e905ee0614be87c3711d6529f2582e5729f/src/subscriptions/types.ts#L159-L167
    // cancelled is true if status cancelled and endsAt populated
    const isCancelled = userSub?.status === 'cancelled' && (userSub?.endsAt ? true : false)
    return {
        plan: userSub?.currentPlan,
        planPrice: productPlan.price,
        status: userSub?.status,
        statusFormatted: userSub?.status_formatted,
        endsAt: userSub?.endsAt,
        renewsAt: userSub?.renewsAt,
        isCancelled: isCancelled,
    }
})
