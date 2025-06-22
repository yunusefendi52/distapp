import { getActiveSubs } from "./update-payment.get"

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

    const activeSubs = await getActiveSubs(event.context.auth.userId)

    const isCancelled = activeSubs?.endsAt ? true : false
    return {
        plan: activeSubs?.product.name,
        planPrice: activeSubs?.amount,
        status: activeSubs?.status,
        statusFormatted: activeSubs?.status,
        endsAt: activeSubs?.endsAt,
        renewsAt: activeSubs?.currentPeriodEnd,
        isCancelled: isCancelled,
        doNotShow: false,
    }
})
