<template>
    <div class="max-w-5xl mx-auto px-5 py-10">
        <h1 class="text-4xl font-bold tracking-tight">Pricing</h1>
        <p class="font-light mt-3 max-w-xl leading-relaxed">
            Self-host for free, or let us run it for you. No credit card to get started.
        </p>

        <div class="mt-6">
            <DiscountLabel />
        </div>

        <div class="grid sm:grid-cols-2 gap-5 mt-6">
            <PlanCard v-for="plan in plans" :key="plan.name" :name="plan.name" :price="plan.price"
                :period="plan.period" :highlighted="plan.highlighted" :features="plan.features">
                <NuxtLink :to="getStartedTo" class="mt-6">
                    <Button :label="plan.cta" :outlined="!plan.highlighted" fluid />
                </NuxtLink>
            </PlanCard>
        </div>

        <div class="text-center text-sm text-gray-500 mt-5">
            <p>Have questions? Email us at
                <a href="mailto:contact@distapp.app" class="underline">contact@distapp.app</a>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'

definePageMeta({
    layout: 'content-layout',
})
useTitleApp('Pricing')

const cookie = useCookie(cookieAuthKey)
const isLoggedIn = computed(() => cookie.value ? true : false)
const getStartedTo = computed(() => isLoggedIn.value ? '/account-settings/billing' : '/signin?redirect=/account-settings/billing')

const { plans } = usePricingPlans()
</script>
