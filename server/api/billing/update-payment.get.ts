export default defineEventHandler(async event => {
    const subscription = await getUserSubsription(event.context.auth.email!)
    return subscription!.urls!.update_payment_method
})