import { getSubscription, getVariant, lemonSqueezySetup, listSubscriptions } from "@lemonsqueezy/lemonsqueezy.js"

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

export async function getProductPlan() {
    // const productVariant = await getVariant(getProductVariandId(), {
    //     include: ['price-model', 'product'],
    // })
    // if (productVariant.error) {
    //     throw createError({
    //         message: `Error get variant current ${productVariant.error.message}`
    //     })
    // }
    return {
        price: 333, // DEPRECATED???
    }
}

export async function getUrlsSubscription(subscriptionId: string) {
    const { data, error } = await getSubscription(subscriptionId)
    if (error) {
        throw createError({
            message: error.message,
        })
    }
    return {
        updatePaymentMethod: data?.data.attributes.urls.update_payment_method,
    }
}

export async function getUserSubscriptionLms(userEmail: string) {
    // this will get latest subscription
    const userSubs = await listSubscriptions({
        filter: {
            productId: process.env.NUXT_LEMONSQUEEZY_PRODUCT_ID_TEST!,
            storeId: process.env.NUXT_LEMONSQUEEZY_STORE_ID!,
            userEmail: userEmail
        },
        page: {
            size: 1
        }
    });
    if (userSubs.error) {
        throw createError({
            message: userSubs.error.message,
            statusCode: 500
        });
    }
    const data = userSubs.data?.data;
    return data && data.length ? data[0] : undefined;
}
