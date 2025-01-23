<template>
    <div class="flex flex-row">
        <span class="flex-1 font-bold text-3xl bg-gradient-to-r bg-clip-text text-transparent inline-block"
            :class="priceName === 'Free' ? 'from-blue-600 via-green-500 to-indigo-400 ' : 'from-orange-500 via-orange-300 to-orange-100'">{{
                priceName }}</span>
        <div class="flex flex-row gap-3 items-end flex-wrap">
            <span class="text-2xl font-bold">{{ price }}</span>
            <span v-if="priceName !== 'Free'">/month</span>
        </div>
    </div>
    <div class="mt-5 flex flex-col gap-5 flex-1">
        <div class="flex flex-row gap-1" v-for="v in features">
            <span class="flex-1 font-semibold text-lg">{{ v.name }}</span>
            <span class="font-semibold text-lg">{{ v.desc }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    priceName: string,
    price: string,
    features: {
        name: string,
        desc: string
    }[],
}>()
</script>
