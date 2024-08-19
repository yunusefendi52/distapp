<template>
    <NuxtLoadingIndicator />
    <NuxtLayout>
        <NuxtPage />
        <DynamicDialog />
    </NuxtLayout>
    <Toast />
    <ConfirmPopup />
</template>

<script setup lang="ts">
useAppTheme()
</script>

<style lang="scss">
html,
body,
#__nuxt {
    margin: 0px;
    height: 100%;
    width: 100%;
        background: var(--p-content-background);
}
</style>
