import { updateSubscription } from "@lemonsqueezy/lemonsqueezy.js"

export default defineEventHandler(async event => {
    const { isCancel: isCancelStr } = getQuery(event)
    const isCancel = isCancelStr === 'true'
    const subs = await getUserSubsription(event.context.auth.email!)
    await updateSubscription(subs.subscriptionId!, {
        cancelled: isCancel,
    })
})