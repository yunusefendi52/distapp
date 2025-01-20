import { updateSubscription } from "@lemonsqueezy/lemonsqueezy.js"

export default defineEventHandler(async event => {
    const { isCancel: isCancelStr } = getQuery(event)
    const isCancel = isCancelStr === 'true'
    const subs = await getUserSubFromDb(event)
    await updateSubscription(subs!.subscriptionId, {
        cancelled: isCancel,
    })
})