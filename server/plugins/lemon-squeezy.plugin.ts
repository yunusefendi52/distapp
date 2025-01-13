import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js"

export const checkLsTestMode = process.env.NUXT_LEMONSQUEEZY_TEST_MODE === 'true'

export default defineNitroPlugin(async (nuxtApp) => {
    const apiKey = checkLsTestMode
        ? process.env.NUXT_LEMONSQUEEZY_TEST_API_KEY
        : process.env.NUXT_LEMONSQUEEZY_PROD_API_KEY
    if (!apiKey) {
        return
    }

    lemonSqueezySetup({
        apiKey,
        onError: (error) => console.error("Error lemonsqueezy!", error),
    })
})