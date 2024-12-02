<template>
    <LazyAppDrawerButton />
    <span class="text-2xl font-bold py-2">{{ props.title }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{
    title?: string | undefined,
}>()
</script>