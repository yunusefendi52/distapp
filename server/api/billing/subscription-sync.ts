import crypto from 'crypto'

export type SubsStatusType = typeof tables.users_subs.status.enumValues[number]

export default defineEventHandler(async event => {
    const rawBody = (await readRawBody(event))!
    const secretKey = getLsTestMode() ? process.env.NUXT_LEMONSQUEEZY_WEBHOOK_SECRET_TEST! : process.env.NUXT_LEMONSQUEEZY_WEBHOOK_SECRET_PROD!
    const hmac = crypto.createHmac('sha256', secretKey)
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8')
    const signature = Buffer.from(
        getHeader(event, 'X-Signature')!,
        'utf8'
    )

    // @ts-ignore
    if (!crypto.timingSafeEqual(digest, signature)) {
        setResponseStatus(event, 404, 'invalid request data request')
        return
    }
    const webhookEvent: WebhookEvent = JSON.parse(rawBody)
    if (!webhookEvent.meta) {
        throw createError({
            message: "Event body is missing the 'meta' property.",
            statusCode: 400,
        })
    } else if (webhookEvent.data) {
        if (webhookEvent.meta.event_name.startsWith('subscription_payment_')) {
            console.log('webhook subs sync', webhookEvent)
        } else if (webhookEvent.meta.event_name.startsWith('subscription_')) {
            const userId = webhookEvent.meta?.custom_data.user_id
            const pUserId = webhookEvent.meta?.custom_data.p_user_id

            // Save subscription events; obj is a Subscription
            const attributes = webhookEvent.data.attributes
            const variantId = attributes.variant_id.toString()

            const db = event.context.drizzle

            const subsStatus: typeof tables.users_subs.status.enumValues[number] | undefined
                = tables.users_subs.status.enumValues.find(e => e as string === attributes.status)
            if (!subsStatus) {
                throw createError({
                    message: `Invalid subs status app ${attributes.status}`,
                })
            }

            const updatedAt = new Date(attributes.updated_at)
            // Be careful about null, set to null if you want NULL
            const newSub: NewSubscription = {
                currentPlan: 'basic',
                providerUserId: pUserId,
                customerId: webhookEvent.data.attributes!.customer_id!.toString(),
                subscriptionId: webhookEvent.data.id,
                userId: userId,
                renewsAt: attributes.renews_at ? new Date(attributes.renews_at) : null,
                status: subsStatus,
                status_formatted: attributes.status_formatted,
                createdAt: new Date(attributes.created_at),
                updatedAt: updatedAt,
                endsAt: attributes.ends_at ? new Date(attributes.ends_at) : null,
                webhookEventName: webhookEvent.meta.event_name,
            }
            // console.info('newSubnewSubnewSub', { newSub, data: webhookEvent.data.id })
            await db.insert(tables.users_subs)
                .values(newSub)
                .onConflictDoUpdate({
                    target: tables.users_subs.customerId,
                    set: newSub,
                    setWhere: updatedAt ? sql`COALESCE(${tables.users_subs.updatedAt}, 0) < ${updatedAt.getTime()}` : undefined,
                })
        } else {
            console.log('webhook subs sync not implemented', webhookEvent)
        }
    } else {
        throw createError({
            message: `not implemented, no idea what is this`,
        })
    }
})
