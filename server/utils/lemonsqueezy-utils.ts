import { listSubscriptions } from "@lemonsqueezy/lemonsqueezy.js"
import { checkLsTestMode } from "../plugins/lemon-squeezy.plugin"

export function getProductVariandId() {
    return checkLsTestMode ? process.env.NUXT_LEMONSQUEEZY_VARIANT_ID_TEST! : process.env.NUXT_LEMONSQUEEZY_VARIANT_ID_PROD!
}

export async function getUserSubsription(email: string) {
    // Note do not change dunning to expired before testing this
    const userSubs = await listSubscriptions({
        filter: {
            storeId: process.env.NUXT_LEMONSQUEEZY_STORE_ID!,
            userEmail: email,
            variantId: getProductVariandId(),
        },
        include: ['customer', 'product', 'store'],
        page: {
            size: 2,
        },
    }).then(e => e.data!.data).then(singleOrDefault)
    const returnedSub = userSubs?.attributes
    const subscriptionId = returnedSub?.first_subscription_item?.subscription_id
    if (!subscriptionId && returnedSub) {
        throw createError({
            message: 'SubscriptionId returned null in your account',
        })
    }
    return {
        ...returnedSub,
        /// Mapped from app, not from lemonsqueezy
        subscriptionId,
    }
}