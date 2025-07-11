import { validateIfDiscountValid } from "./get-discount.get"

export default defineEventHandler(async event => {
    if (!isBillingEnabled(event)) {
        throw createError({
            message: 'Billing disabled',
        })
    }

    const { checkoutOrigin } = getQuery(event)
    const db = event.context.drizzle
    const user = await db.select()
        .from(tables.users)
        .where(eq(tables.users.id, event.context.auth.userId))
        .then(takeUniqueOrThrow)

    const polar = createPollar()
    const userMetadata = {
        userId: event.context.auth.userId,
        p_user_id: user.providerUserId!,
    }
    let discountId: string | undefined = undefined

    // Validate default discount provided to user
    const discountUser = getDiscountByUser(event.context.auth.userId)
    if (discountUser && !discountId) {
        try {
            const discount = await polar.discounts.get({
                id: discountUser,
            })
            if (validateIfDiscountValid(discount)) {
                discountId = discount.id   
            }
        } catch (e) {
            console.log('error getting discount', e)
        }
    }

    try {
        const checkout = await polar.checkouts.create({
            products: [getPolarEnv().productId],
            customerEmail: user.email,
            externalCustomerId: event.context.auth.userId,
            metadata: userMetadata,
            customerMetadata: userMetadata,
            discountId: discountId || undefined,
            allowDiscountCodes: false,
            successUrl: `${checkoutOrigin}/api/billing/checkout-confirmation`,
        })
        return checkout.url
    } catch (e) {
        throw createError({
            message: `${e}`,
        })
    }
})