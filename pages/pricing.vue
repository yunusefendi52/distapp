<template>
    <div>
        <div class="w-full md:max-w-5xl m-auto p-5">
            <h1 class="text-5xl font-medium">Pricing</h1>
            <div class="mt-5">
                <div class="flex max-w-full flex-col lg:max-w-5xl mx-auto my-10 gap-5">
                    <!-- <div class="flex flex-row gap-4">
                        <SelectButton v-model="value" :options="options" option-label="name" />
                        <span></span>
                    </div> -->
                    <div class="flex-1 flex flex-col lg:flex-row gap-5">
                        <AppCard class="w-full">
                            <div class="flex flex-col gap-2 justify-stretch p-2 h-full">
                                <PriceCard price-name="Pro" price="$4" :features="proFeatures" />
                                <div class="mt-5 flex flex-col gap-2">
                                    <DiscountLabel />
                                    <NuxtLink :to="getStaredTo">
                                        <Button label="Get Started" outlined fluid />
                                    </NuxtLink>
                                </div>
                            </div>
                        </AppCard>
                        <AppCard class="w-full">
                            <div class="flex flex-col gap-2 justify-stretch p-2 h-full">
                                <PriceCard price-name="Free" price="$0" :features="freeFeatures" />
                                <div class="mt-5 flex flex-col gap-2">
                                    <NuxtLink :to="getStaredTo">
                                        <Button label="Get Started" outlined fluid />
                                    </NuxtLink>
                                </div>
                            </div>
                        </AppCard>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import { freeFeatures, proFeatures } from '#imports'

definePageMeta({
    layout: 'content-layout',
})
useTitleApp('Pricing')

const options = ref<{
    value: 'monthly',
    name: string,
}[]>([{
    value: 'monthly',
    name: 'Monthly billing',
}])
const value = ref(options.value[0])
const cookie = useCookie(cookieAuthKey)
const isLoggedIn = computed(() => cookie.value ? true : false)
const getStaredTo = computed(() => isLoggedIn.value ? '/account-settings/billing' : '/signin?redirect=/account-settings/billing')
</script>

<style lang="css" scoped>
li {
    margin: 10px 0
}
</style>