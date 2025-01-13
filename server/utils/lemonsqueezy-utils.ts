import { lemonSqueezySetup, listSubscriptions } from "@lemonsqueezy/lemonsqueezy.js"

export function getProductVariandId() {
    return getLsTestMode() ? process.env.NUXT_LEMONSQUEEZY_VARIANT_ID_TEST! : process.env.NUXT_LEMONSQUEEZY_VARIANT_ID_PROD!
}

export function getLsTestMode() {
    return process.env.NUXT_LEMONSQUEEZY_TEST_MODE === 'true'
}

export function setupLemonSqueezy() {
    const apiKey = getLsTestMode()
        ? process.env.NUXT_LEMONSQUEEZY_TEST_API_KEY
        : process.env.NUXT_LEMONSQUEEZY_PROD_API_KEY
    if (!apiKey) {
        return
    }

    lemonSqueezySetup({
        apiKey,
        onError: (error) => console.error("Error lemonsqueezy!", error),
    })
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