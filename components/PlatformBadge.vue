<template>
    <div
        class="self-start flex flex-row gap-2 px-[10px] py-[2px] items-center rounded-full bg-[var(--p-surface-200)] dark:bg-[var(--p-surface-700)]">
        <i v-if="osType === 'android'" class="pi pi-android"></i>
        <i v-else-if="osType === 'ios'" class="pi pi-apple"></i>
        <span>
            {{ osType === 'android' ? 'Android' : 'iOS' }}
        </span>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    osType: OsType |null | undefined,
}>()
</script>