import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js"

export type CustomerMetadata = {
    userId: string,
    providerUserId: string,
    email: string,
}

export default defineEventHandler(async event => {
    if (!isBillingEnabled(event)) {
        throw createError({
            message: 'Billing disabled',
        })
    }

    const { checkoutOrigin } = getQuery(event)
    const db = event.context.drizzle
    const activeSub = await getUserSubFromDb(event)
    const isSubsActive = checkIfSubsActive(event, activeSub)
    if (isSubsActive) {
        console.warn('User has already subscription', { userId: event.context.auth.userId, })
        throw createError({
            message: 'User already has subscription',
        })
    }

    const variantId = getProductVariandId()
    const user = await db.select()
        .from(tables.users)
        .where(eq(tables.users.id, event.context.auth.userId))
        .then(takeUniqueOrThrow)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 12)
    const { data } = await createCheckout(process.env.NUXT_LEMONSQUEEZY_STORE_ID!, variantId, {
        expiresAt: expiresAt.toISOString(),
        checkoutData: {
            email: user.email!,
            name: user.name!,
            custom: {
                userId: event.context.auth.userId,
                p_user_id: user.providerUserId!,
            },
        },
        productOptions: {
            redirectUrl: `${checkoutOrigin}/api/billing/checkout-confirmation`,
        },
    })
    return data!.data.attributes.url
})