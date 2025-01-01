<template>
    <div class="flex flex-row gap-4 items-center pl-5" style="height: 62px;">
        <div class="w-8 flex items-center justify-center">
            <AppIcon class="fill-black dark:fill-white h-8" />
        </div>
        <label class="font-semibold text-xl flex-1">DistApp</label>
        <ThemeSwitcher />
    </div>
    <!-- <AppDivider orientation="horizontal" /> -->
</template>

<script setup lang="ts">
import AppIcon from '~/public/appicon.svg'
</script>