export default defineEventHandler(async event => {
    if (!isBillingEnabled(event)) {
        throw createError({
            message: 'Billing disabled',
        })
    }

    const subscription = await getUserSubFromDb(event)
    const { updatePaymentMethod } = await getUrlsSubscription(subscription!.subscriptionId)
    return updatePaymentMethod
})