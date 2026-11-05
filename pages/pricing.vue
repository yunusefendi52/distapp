<template>
    <div class="acc max-w-5xl mx-auto px-5 py-10">
        <h1 class="text-4xl font-bold tracking-tight">Pricing</h1>
        <p class="font-light mt-3 max-w-xl leading-relaxed">
            Self-host for free, or let us run it for you. No credit card to get started.
        </p>

        <div class="mt-6">
            <DiscountLabel />
        </div>

        <div class="grid sm:grid-cols-2 gap-5 mt-6">
            <div v-for="plan in plans" :key="plan.name" class="flex flex-col rounded-2xl border p-6"
                :class="plan.highlighted
                    ? 'border-[var(--acc-border)] bg-[var(--acc-soft)]'
                    : 'border-[var(--p-content-border-color)]'">
                <div class="flex items-center justify-between">
                    <span class="font-semibold text-lg">{{ plan.name }}</span>
                    <span v-if="plan.highlighted"
                        class="rounded-full border border-[var(--acc-border)] px-3 py-0.5 text-xs font-medium text-[var(--acc)]">
                        Popular
                    </span>
                </div>
                <div class="mt-2 flex items-baseline gap-1">
                    <span class="text-4xl font-bold">{{ plan.price }}</span>
                    <span v-if="plan.period" class="text-base">{{ plan.period }}</span>
                </div>
                <div class="mt-5 flex flex-col gap-3 flex-1">
                    <div v-for="f in plan.features" :key="f.name" class="flex flex-row gap-3">
                        <span class="flex-1 text-base font-light">{{ f.name }}</span>
                        <div class="flex flex-col text-end">
                            <span class="text-base font-semibold">{{ f.desc }}</span>
                            <span v-if="f.desc2" class="text-sm">{{ f.desc2 }}</span>
                        </div>
                    </div>
                </div>
                <NuxtLink :to="getStartedTo" class="mt-6">
                    <Button :label="plan.cta" :outlined="!plan.highlighted" fluid />
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<style lang="css" scoped>
.applight .acc {
    --acc: #15803d;
    --acc-soft: rgb(21 128 61 / 0.06);
    --acc-border: rgb(21 128 61 / 0.22);
}

.appdark .acc {
    --acc: #4ade80;
    --acc-soft: rgb(74 222 128 / 0.09);
    --acc-border: rgb(74 222 128 / 0.28);
}
</style>

<script setup lang="ts">
import { NuxtLink } from '#components'
import { freeFeatures, proFeatures } from '#imports'

definePageMeta({
    layout: 'content-layout',
})
useTitleApp('Pricing')

const cookie = useCookie(cookieAuthKey)
const isLoggedIn = computed(() => cookie.value ? true : false)
const getStartedTo = computed(() => isLoggedIn.value ? '/account-settings/billing' : '/signin?redirect=/account-settings/billing')

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: '',
        highlighted: false,
        cta: 'Get Started',
        features: freeFeatures,
    },
    {
        name: 'Pro',
        price: '$4',
        period: '/month',
        highlighted: true,
        cta: 'Upgrade to Pro',
        features: proFeatures,
    },
]
</script>
