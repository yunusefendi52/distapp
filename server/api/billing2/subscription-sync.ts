import { syncUserSubscription } from "../billing/subscription-sync";
import { Webhooks } from '../../polar/webhookHandler'

export default defineEventHandler((event) => {
    const { } = useRuntimeConfig(event)
    const webhooksHandler = Webhooks({
        webhookSecret: getPolarEnv().webhookSecretKey,
        onPayload: async (payload) => {
            if (payload.type === 'subscription.active'
                || payload.type === 'subscription.canceled'
                || payload.type === 'subscription.revoked'
                || payload.type === 'subscription.uncanceled') {
                await syncUserSubscription(
                    event.context.drizzle,
                    payload.data.metadata.userId as string,
                    payload.data.metadata.p_user_id as string,
                    payload.data.id, {
                    card_brand: '-',
                    created_at: payload.data.createdAt.toISOString(),
                    customer_id: 0,
                    ends_at: payload.data.endsAt?.toISOString() || null,
                    first_subscription_item: {
                        created_at: payload.data.createdAt.toISOString(),
                        updated_at: payload.data.modifiedAt?.toISOString() || '',
                        price_id: 0,
                        quantity: 0,
                        subscription_id: 0,
                    },
                    product_id: 0,
                    product_name: payload.data.product.name,
                    renews_at: payload.data.currentPeriodEnd?.toISOString(),
                    status: payload.data.status,
                    status_formatted: payload.data.status,
                    test_mode: getPolarTestMode(),
                    updated_at: payload.data.modifiedAt?.toISOString() || '',
                    user_email: payload.data.customer.email,
                    user_name: payload.data.customer.name || '',
                    variant_id: 0,
                    variant_name: '',
                }, '', payload.type)
            }
        },
    });

    return webhooksHandler(event);
});
