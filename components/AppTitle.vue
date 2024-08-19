<template>
    <LazyAppDrawerButton />
    <span class="text-2xl font-bold">{{ props.title }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{
    title?: string | undefined,
}>()
</script>