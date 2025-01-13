<template>
    <div v-if="status === 'pending'">
        <ProgressSpinner style="width: 30px; height: 30px; margin: unset;" strokeWidth="6" class="self-center"
            data-testid="menu-loading" />
    </div>
    <div v-else class="flex max-w-full flex-col lg:max-w-5xl mx-auto my-10 gap-5">
        <div class="flex-1 flex flex-col lg:flex-row gap-5 items-start">
            <AppCard class="w-full">
                <div class="flex flex-col gap-2 justify-stretch p-2">
                    <div class="flex flex-row">
                        <span
                            class="flex-1 font-bold text-3xl bg-gradient-to-r from-orange-500 via-orange-300 to-orange-100 bg-clip-text text-transparent inline-block">Pro</span>
                        <div class="flex flex-row gap-3 items-end flex-wrap">
                            <span class="text-2xl font-bold">${{ (data?.planPrice || 0) / 100 }}</span>
                            <span>/month</span>
                        </div>
                    </div>
                    <div class="mt-5 flex flex-col gap-5">
                        <div class="flex flex-row gap-1">
                            <span class="flex-1 font-semibold text-lg">Number of apps</span>
                            <span class="font-semibold text-lg">Up To 250</span>
                        </div>
                        <div class="flex flex-row gap-1">
                            <span class="flex-1 font-semibold text-lg">Number of organization</span>
                            <span class="font-semibold text-lg">Up to 20</span>
                        </div>
                    </div>
                    <div class="mt-5 flex flex-col gap-2">
                        <template v-if="data?.plan === 'basic'">
                            <span>{{ data?.endsAt ? 'Ends' : 'Renews' }} at {{ formatDate(data?.endsAt ||
                                data?.renewsAt)
                                }}</span>
                            <Button v-if="data?.isCancelled" label="Resume Subscription" outlined
                                :loading="toggleSubsPending" fluid @click="() => toggleSubs(false)" class="mt-3" />
                            <Button v-else :loading="toggleSubsPending" label="Cancel Renew" outlined class="mt-3"
                                @click="() => toggleSubs(true)" />
                            <Button label="Update Payment Method" outlined :loading="updatePaymentPending" fluid
                                @click="() => updatePayment()" class="mt-3" />
                            <span class="mt-4">Your payment status: {{ data.statusFormatted
                                }}</span>
                        </template>
                        <Button v-if="data?.plan !== 'basic'" label="Checkout" outlined :loading="isPending" fluid
                            @click="() => mutate()" class="mt-3" />
                    </div>
                </div>
            </AppCard>
            <AppCard class="w-full">
                <div class="flex flex-col gap-2 justify-stretch p-2">
                    <div class="flex flex-row">
                        <span
                            class="flex-1 font-bold text-3xl bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 bg-clip-text text-transparent inline-block">Free</span>
                        <div class="flex flex-row gap-3 items-end flex-wrap">
                            <span class="text-2xl font-bold">$0</span>
                        </div>
                    </div>
                    <div class="mt-5 flex flex-col gap-5">
                        <div class="flex flex-row gap-1">
                            <span class="flex-1 font-semibold text-lg">Number of apps</span>
                            <span class="font-semibold text-lg">Up to 3</span>
                        </div>
                        <div class="flex flex-row gap-1">
                            <span class="flex-1 font-semibold text-lg">Number of organization</span>
                            <span class="font-semibold text-lg">Only 1</span>
                        </div>
                    </div>
                    <Button v-if="data?.plan !== 'basic'" class="mt-5" label="Your current plan" outlined disabled />
                </div>
            </AppCard>
        </div>
        <!-- <span v-if="data?.status === 'checkout_open'">Your checkout is now being processed.</span>
        <span v-else-if="data?.status === 'checkout_confirmed'">Your checkout is confirmed.</span>
        <span v-else-if="data?.status === 'checkout_succeeded'">Your checkout is processed.</span>
        <span v-else-if="data?.status === 'cancelled'">Your subscription is cancelled.</span> -->
    </div>
</template>

<script setup lang="ts">
import { formatDate } from '#imports'

const { data, status, refresh } = useFetch('/api/billing/current-billing')

const { mutate, isPending } = useMutation({
    mutationFn: () => $fetch.raw('/api/billing/checkout', {
        method: 'get',
        query: {
            'checkoutOrigin': window.origin,
        },
    }).then(e => {
        location.href = e._data!
    })
})
const { mutate: toggleSubs, isPending: toggleSubsPending } = useMutation({
    mutationFn: async (isCancel: boolean) => {
        if (isCancel && !confirm('You will not be charged next billing cycle. Continue?')) {
            return new Promise(r => r(undefined))
        }
        await $fetch.raw('/api/billing/toggle-subs', {
            method: 'get',
            query: {
                'isCancel': isCancel,
            },
        })
        await new Promise(r => setTimeout(r, 1500))
        refresh()
    }
})

const { mutate: updatePayment, isPending: updatePaymentPending } = useMutation({
    mutationFn: async () => {
        const r = await $fetch.raw('/api/billing/update-payment', {
            method: 'get',
        })
        window.open(r._data, '_blank')
    }
})
</script>
