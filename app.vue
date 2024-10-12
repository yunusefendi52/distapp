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
const { appTheme } = useAppTheme()
useHead({
    htmlAttrs: {
        class: [appTheme],
    },
    title: 'DistApp',
})
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
