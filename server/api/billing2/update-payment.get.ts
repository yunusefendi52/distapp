export async function getActiveSubs(userId: string) {
    const polar = createPollar()
    const activeSubs = await polar.subscriptions.list({
        metadata: {
            userId: userId,
        },
        limit: 2,
        sorting: ['-started_at']
    }).then(e => e.result.items).then(e => e && e.length ? e[0]: undefined)
    if (activeSubs && (
        activeSubs.status === 'active'
        || activeSubs.status === 'past_due')) {
        return activeSubs
    }
    return activeSubs
}

export default defineEventHandler(async event => {
    if (!isBillingEnabled(event)) {
        throw createError({
            message: 'Billing disabled',
        })
    }

    const polar = createPollar()
    const activeSubs = await getActiveSubs(event.context.auth.userId)
    if (!activeSubs) {
        throw createError({
            message: `You cannot update payment. You don't have subscription.`
        })
    }

    const { customerPortalUrl } = await polar.customerSessions.create({
        customerId: activeSubs.customerId,
    })
    return customerPortalUrl
})