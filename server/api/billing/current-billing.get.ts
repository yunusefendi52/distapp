import { defineEventHandler } from 'h3'
import { syncUserSubscription } from './subscription-sync'

export default defineEventHandler(async event => {
    if (!isBillingEnabled(event)) {
        return {
            plan: '',
            planPrice: 0,
            status: '',
            statusFormatted: '',
            endsAt: '',
            renewsAt: '',
            isCancelled: false,
            doNotShow: true,
        }
    }

    const userSubLms = await getUserSubscriptionLms(event.context.auth.email!)
    if (userSubLms) {
        const subAttrs = userSubLms.attributes
        const db = event.context.drizzle
        const user = await db.select()
            .from(tables.users)
            .where(eq(tables.users.id, event.context.auth.userId))
            .then(takeUniqueOrThrow)
        await syncUserSubscription(event.context.drizzle, user.id, user.providerUserId!, userSubLms.id, {
            card_brand: subAttrs.card_brand || undefined,
            created_at: subAttrs.created_at,
            customer_id: subAttrs.customer_id,
            ends_at: subAttrs.ends_at,
            product_id: subAttrs.product_id,
            product_name: subAttrs.product_name,
            renews_at: subAttrs.renews_at,
            status: subAttrs.status,
            status_formatted: subAttrs.status_formatted,
            updated_at: subAttrs.updated_at,
            user_email: subAttrs.user_email,
            user_name: subAttrs.user_name,
            variant_id: subAttrs.variant_id,
            variant_name: subAttrs.variant_name,
            test_mode: subAttrs.test_mode,
            first_subscription_item: subAttrs.first_subscription_item ? {
                ...subAttrs.first_subscription_item,
            } : undefined,
        })
    }

    const productPlan = await getProductPlan()
    var userSub = await getUserSubFromDb(event)
    // https://github.com/lmsqueezy/lemonsqueezy.js/blob/b1f66e905ee0614be87c3711d6529f2582e5729f/src/subscriptions/types.ts#L159-L167
    // cancelled is true if status cancelled and endsAt populated
    const isCancelled = userSub?.status === 'cancelled' && (userSub?.endsAt ? true : false)
    const isSubsActive = checkIfSubsActive(event, userSub)
    if (!isSubsActive) {
        // to allow user to checkout again
        userSub = undefined
    }
    return {
        plan: userSub?.currentPlan,
        planPrice: productPlan.price,
        status: userSub?.status,
        statusFormatted: userSub?.status_formatted,
        endsAt: userSub?.endsAt,
        renewsAt: userSub?.renewsAt,
        isCancelled: isCancelled,
        doNotShow: false,
    }
})
