<template>
    <div
        class="self-start flex flex-row gap-2 px-[10px] py-[2px] items-center rounded-full bg-[var(--p-surface-200)] dark:bg-[var(--p-surface-700)]">
        <i v-if="osType === 'android'" class="pi pi-android"></i>
        <i v-else-if="osType === 'ios'" class="pi pi-apple"></i>
        <i v-else-if="osType === 'desktop'" class="pi pi-desktop"></i>
        <i v-else-if="osType === 'windows'" class="pi pi-microsoft"></i>
        <i v-else-if="osType === 'macos'" class="pi pi-apple"></i>
        <i v-else-if="osType === 'linux'" class="pi pi-desktop"></i>
        <i v-else-if="osType === 'embedded'" class="pi pi-microchip"></i>
        <i v-else-if="osType === 'other'" class="pi pi-box"></i>
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
    switch (props.osType) {
        case 'android':
            return 'Android';
        case 'ios':
            return 'iOS';
        case 'desktop':
            return 'Desktop';
        case 'windows':
            return 'Windows';
        case 'macos':
            return 'MacOS';
        case 'linux':
            return 'Linux';
        case 'embedded':
            return 'Embedded';
        case 'other':
            return 'Other';
        default:
            return '';
    }
})
</script>