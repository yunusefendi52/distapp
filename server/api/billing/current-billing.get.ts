import { getVariant } from "@lemonsqueezy/lemonsqueezy.js"

export default defineEventHandler(async event => {
    const userId = event.context.auth.userId
    const db = event.context.drizzle
    async function getUserSub() {
        return await db.select()
            .from(tables.users_subs)
            .where(eq(tables.users_subs.userId, userId))
            .then(singleOrDefault)
    }
    const productVariant = await getVariant(getProductVariandId(), {
        include: ['price-model', 'product'],
    })
    var userSub = await getUserSub()
    const returnedSub = await getUserSubsription(event.context.auth.email!)
    return {
        plan: userSub?.currentPlan,
        planPrice: productVariant.data?.data.attributes.price, // DEPRECATED???
        status: returnedSub?.status,
        statusFormatted: returnedSub?.status_formatted,
        endsAt: returnedSub?.ends_at,
        renewsAt: returnedSub?.renews_at,
        isCancelled: returnedSub?.cancelled,
        dta: import.meta.dev ? {
            returnedSub,
        } : {},
    }
})
