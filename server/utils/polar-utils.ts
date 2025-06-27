import { Polar } from "@polar-sh/sdk"

export function getPolarTestMode() {
    return process.env.NUXT_POLAR_TEST_MODE === 'true'
}

export function createPollar() {
    const polar = new Polar({
        accessToken: getPolarEnv().accessToken,
        server: getPolarTestMode() ? 'sandbox' : 'production',
    })
    return polar
}

export function getPolarEnv() {
    const isTestMode = getPolarTestMode()
    return isTestMode ? {
        accessToken: process.env.NUXT_POLAR_ACCESS_TOKEN_TEST!,
        productId: process.env.NUXT_POLAR_PRODUCT_ID_TEST!,
        webhookSecretKey: process.env.NUXT_POLAR_WEBHOOK_SECRET_KEY_TEST!,
        discountId: process.env.NUXT_POLAR_DISCOUNT_ID_TEST,
        discountId2: process.env.NUXT_POLAR_DISCOUNT_ID_2_TEST,
    } : {
        accessToken: process.env.NUXT_POLAR_ACCESS_TOKEN_PROD!,
        productId: process.env.NUXT_POLAR_PRODUCT_ID_PROD!,
        webhookSecretKey: process.env.NUXT_POLAR_WEBHOOK_SECRET_KEY_PROD!,
        discountId: process.env.NUXT_POLAR_DISCOUNT_ID_PROD,
        discountId2: process.env.NUXT_POLAR_DISCOUNT_ID_2_PROD,
    }
}

export function getDiscountByUser(userId: string) {
    const userIds = process.env.NUXT_POLAR_DISCOUNT_USER_IDS?.split(':') || []
    return userIds.includes(userId) ? getPolarEnv().discountId : getPolarEnv().discountId2
}