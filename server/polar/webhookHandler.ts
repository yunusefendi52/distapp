import {
    type WebhooksConfig,
    handleWebhookPayload,
} from "@polar-sh/adapter-utils";
import {
    WebhookVerificationError,
    validateEvent,
} from "@polar-sh/sdk/webhooks";
import {
    type H3Event,
    createError,
    getHeader,
    readBody,
    setResponseStatus,
} from "h3";

export const Webhooks = ({
    webhookSecret,
    onPayload,
    entitlements,
    ...eventHandlers
}: WebhooksConfig) => {
    return async (event: H3Event) => {
        const requestBody = await readRawBody(event);

        const webhookHeaders = {
            "webhook-id": getHeader(event, "webhook-id") ?? "",
            "webhook-timestamp": getHeader(event, "webhook-timestamp") ?? "",
            "webhook-signature": getHeader(event, "webhook-signature") ?? "",
        };

        let webhookPayload: ReturnType<typeof validateEvent>;

        try {
            webhookPayload = validateEvent(
                requestBody!,
                webhookHeaders,
                webhookSecret,
            );
        } catch (error) {
            if (error instanceof WebhookVerificationError) {
                console.error("Failed to verify webhook event", error);
                setResponseStatus(event, 403);
                return { received: false };
            }

            console.error("Failed to validate webhook event", error);
            throw createError({
                statusCode: 500,
                // @ts-ignore
                statusMessage: error?.statusMessage,
                // @ts-ignore
                message: error?.message ?? "Internal server error",
            });
        }

        try {
            await handleWebhookPayload(webhookPayload, {
                webhookSecret,
                entitlements,
                onPayload,
                ...eventHandlers,
            });

            return { received: true };
        } catch (error) {
            console.error("Webhook error", error);
            throw createError({
                statusCode: 500,
                // @ts-ignore
                statusMessage: error?.statusMessage,
                // @ts-ignore
                message: error?.message ?? "Internal server error",
            });
        }
    };
};