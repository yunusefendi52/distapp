import type { EventHandlerRequest, H3Event } from "h3"
import { verifyWebhookRequest } from "./verifyWebhookRequest"
import { defineEventHandler } from 'h3'
import type { LibSQLDatabase } from "drizzle-orm/libsql"

export type SubsStatusType = typeof tables.users_subs.status.enumValues[number]

export default defineEventHandler(async event => {
    const query = getQuery(event)
    if (query.enabled?.toString() === '0') {
        setResponseStatus(event, 204, 'webhook disabled')
        return
    }

    const rawBody = (await readRawBody(event))!
    const secretKey = getLsTestMode() ? process.env.NUXT_LEMONSQUEEZY_WEBHOOK_SECRET_TEST! : process.env.NUXT_LEMONSQUEEZY_WEBHOOK_SECRET_PROD!
    const signaturePayload = getHeader(event, 'X-Signature')!
    if (!await verifyWebhookRequest(signaturePayload, secretKey, rawBody)) {
        throw createError({
            message: 'Invalid request data sync',
            statusCode: 400,
        })
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
            const attributes = webhookEvent.data.attributes
            const subscriptionId = (attributes.first_subscription_item?.subscription_id || attributes.subscription_id)?.toString()
            if (!subscriptionId) {
                throw createError({
                    message: 'subscriptionId is not defined. Check again the webhook',
                    statusCode: 500,
                })
            }
            const webhookName = webhookEvent.meta.event_name
            const webhookId = webhookEvent.meta.webhook_id
            await syncUserSubscription(
                event.context.drizzle,
                userId,
                pUserId,
                subscriptionId,
                {
                    ...attributes,
                },
                webhookId,
                webhookName)
        } else {
            console.log('webhook subs sync not implemented', webhookEvent)
        }
    } else {
        throw createError({
            message: `not implemented, no idea what is this`,
        })
    }
})

/// Be care full using this, make sure ends_at not null otherwise it will be replaced to null in db
export async function syncUserSubscription(
    db: LibSQLDatabase<typeof tables>,
    userId: string,
    pUserId: string,
    subscriptionId: string,
    attributes: SubscriptionSyncData,
    webhookEventId?: string,
    webhookEventName?: string) {
    const variantId = attributes.variant_id?.toString() || undefined

    const subsStatus = tables.users_subs.status.enumValues.find(e => e as string === attributes.status)
    if (!subsStatus) {
        throw createError({
            message: `Invalid subs status app ${attributes.status}`,
        })
    }

    const updatedAt = attributes.updated_at ? new Date(attributes.updated_at) : undefined
    // Be careful about null, set to null if you want NULL
    const newSub: NewSubscription = {
        currentPlan: 'basic',
        variantId: variantId,
        providerUserId: pUserId,
        customerId: attributes!.customer_id!.toString(),
        subscriptionId: subscriptionId,
        userId: userId,
        renewsAt: attributes.renews_at ? new Date(attributes.renews_at) : null,
        status: subsStatus,
        status_formatted: attributes.status_formatted,
        createdAt: new Date(attributes.created_at),
        updatedAt: updatedAt,
        endsAt: attributes.ends_at ? new Date(attributes.ends_at) : null,
        webhookEventName: webhookEventName || undefined,
        webhookEventId: webhookEventId || undefined,
        cardBrand: attributes.card_brand,
        product_id: attributes.product_id.toString(),
        product_name: attributes.product_name,
        user_name: attributes.user_name,
        variant_name: attributes.variant_name,
        testMode: attributes.test_mode,
        subs_quantity: attributes.first_subscription_item?.quantity || undefined,
        subs_created_at: attributes.first_subscription_item?.created_at || undefined,
        subs_updated_at: attributes.first_subscription_item?.updated_at || undefined,
        subs_price_id: attributes.first_subscription_item?.price_id || undefined,
    }
    await db.insert(tables.users_subs)
        .values(newSub)
        .onConflictDoUpdate({
            target: tables.users_subs.subscriptionId,
            set: newSub,
            setWhere: updatedAt ? sql`COALESCE(${tables.users_subs.updatedAt}, 0) <= ${updatedAt.getTime()}` : undefined,
        })
}


export type SubscriptionSyncData = {
    customer_id: number | string;
    product_id: number;
    variant_id: number;
    product_name: string;
    variant_name: string;
    user_name: string;
    user_email: string;
    status: string;
    status_formatted: string;
    card_brand: string | undefined;
    renews_at: string | undefined;
    ends_at: string | null;
    created_at: string;
    updated_at: string;
    test_mode: boolean;
    first_subscription_item: FirstSubscriptionItem | undefined;
}
