<script setup lang="ts">
withDefaults(defineProps<{
    name: string,
    price: string,
    period?: string,
    highlighted?: boolean,
    badge?: string,
    features: {
        name: string,
        desc: string,
        desc2?: string,
    }[],
}>(), {
    period: '',
    highlighted: false,
    badge: 'Popular',
})
</script>

<template>
    <div class="plan-card flex flex-col rounded-2xl border p-6" :class="highlighted
        ? 'border-[var(--acc-border)] bg-[var(--acc-soft)]'
        : 'border-[var(--p-content-border-color)]'">
        <div class="flex items-center justify-between">
            <span class="font-semibold text-lg">{{ name }}</span>
            <span v-if="highlighted"
                class="rounded-full border border-[var(--acc-border)] px-3 py-0.5 text-xs font-medium text-[var(--acc)]">
                {{ badge }}
            </span>
        </div>
        <div class="mt-2 flex items-baseline gap-1">
            <span class="text-4xl font-bold">{{ price }}</span>
            <span v-if="period" class="text-base">{{ period }}</span>
        </div>
        <div class="mt-5 flex flex-col gap-3 flex-1">
            <div v-for="f in features" :key="f.name" class="flex flex-row gap-3">
                <span class="flex-1 text-base font-light">{{ f.name }}</span>
                <div class="flex flex-col text-end">
                    <span class="text-base font-semibold">{{ f.desc }}</span>
                    <span v-if="f.desc2" class="text-sm">{{ f.desc2 }}</span>
                </div>
            </div>
        </div>
        <slot />
    </div>
</template>

<style lang="css" scoped>
.applight .plan-card {
    --acc: #15803d;
    --acc-soft: rgb(21 128 61 / 0.06);
    --acc-border: rgb(21 128 61 / 0.22);
}

.appdark .plan-card {
    --acc: #4ade80;
    --acc-soft: rgb(74 222 128 / 0.09);
    --acc-border: rgb(74 222 128 / 0.28);
}
</style>
