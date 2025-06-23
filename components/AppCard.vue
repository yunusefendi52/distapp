<script setup lang="ts">
defineProps<{
    applyShadow?: boolean,
}>()
</script>

<template>
    <div class="card" :class="{
        'shadow-lg dark:shadow-gray-900': applyShadow,
    }">
        <slot />
    </div>
</template>

<style scoped>
.app-card {
    border: 1px var(--p-content-border-color) solid;
    border-radius: 8px;
}
</style>