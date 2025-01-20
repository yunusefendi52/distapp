export default defineEventHandler(async event => {
    const subscription = await getUserSubFromDb(event)
    const { updatePaymentMethod } = await getUrlsSubscription(subscription!.subscriptionId)
    return updatePaymentMethod
})