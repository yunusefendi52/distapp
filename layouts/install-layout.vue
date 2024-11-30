<template>
    <div class="flex flex-row gap-1 items-center">
        <AppHeader class="flex-auto" />
        <div class="flex flex-row gap-2 px-3">
            <Button v-if="cookie" label="Sign Out" outlined />
            <Button v-else label="Sign In" outlined />
        </div>
    </div>
    <div class="flex max-w-lg flex-col mx-auto justify-stretch sm:px-0 pt-6 pb-20">
        <slot />
    </div>
</template>

<script setup lang="ts">
const cookie = useCookie(cookieAuthKey)
</script>