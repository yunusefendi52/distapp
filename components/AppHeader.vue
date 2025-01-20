<template>
    <div class="flex flex-row gap-4 items-center pl-5" style="height: 62px;">
        <div @click="goToHomePage" class="w-8 flex items-center justify-center cursor-pointer">
            <AppIcon class="fill-black dark:fill-white h-8" />
        </div>
        <span @click="goToHomePage" class="cursor-pointer font-semibold text-xl flex-1">DistApp</span>
        <ThemeSwitcher />
    </div>
    <!-- <AppDivider orientation="horizontal" /> -->
</template>

<script setup lang="ts">
import AppIcon from '~/public/appicon.svg'

function goToHomePage() {
    navigateTo({
        name: 'index',
    })
}
</script>