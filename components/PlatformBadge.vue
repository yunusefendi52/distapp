<template>
    <div
        class="self-start flex flex-row gap-2 px-[10px] py-[2px] items-center rounded-full bg-[var(--p-surface-200)] dark:bg-[var(--p-surface-700)]">
        <i v-if="osType === 'android'" class="pi pi-android"></i>
        <i v-else-if="osType === 'ios'" class="pi pi-apple"></i>
        <i v-else-if="osType === 'desktop'" class="pi pi-desktop"></i>
        <span class="text-sm">
            {{ platformName }}
        </span>
    </div>
</template>

<script setup lang="ts">
import { OsType } from '~/utils/utils';

const props = defineProps<{
    osType: OsType | null | undefined,
}>()

const platformName = computed(() => {
    if (props.osType === 'android') return 'Android'
    if (props.osType === 'ios') return 'iOS'
    if (props.osType === 'desktop') return 'Desktop'
    return ''
})
</script>