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
    const checkout = await polar.checkouts.create({
        products: [getPolarEnv().productId],
        customerEmail: user.email,
        externalCustomerId: event.context.auth.userId,
        metadata: userMetadata,
        customerMetadata: userMetadata,
        discountId: getPolarEnv().discountId,
        allowDiscountCodes: false,
        successUrl: `${checkoutOrigin}/api/billing/checkout-confirmation`,
    })
    return checkout.url
})