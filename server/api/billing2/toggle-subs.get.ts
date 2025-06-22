import { getActiveSubs } from "./update-payment.get"

export default defineEventHandler(async event => {
    if (!isBillingEnabled(event)) {
        throw createError({
            message: 'Billing disabled',
        })
    }

    const { isCancel: isCancelStr } = getQuery(event)
    const isCancel = isCancelStr === 'true'
    const polar = createPollar()
    const activeSubs = await getActiveSubs(event.context.auth.userId)
    await polar.subscriptions.update({
        id: activeSubs!.id,
        subscriptionUpdate: {
            cancelAtPeriodEnd: isCancel,
        },
    })
})