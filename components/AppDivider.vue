<template>
    <div :class="orientation === 'vertical' ? 'h-full' : 'w-full'" style="background: var(--p-content-border-color);"
        :style="{
            height: orientation === 'vertical' ? null : '1px',
            width: orientation === 'vertical' ? '1px' : null,
        }" />
</template>

<script setup lang="ts">
const { orientation } = withDefaults(defineProps<{
    orientation: 'vertical' | 'horizontal',
}>(), {
    orientation: 'vertical',
})
</script>