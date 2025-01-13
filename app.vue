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
const toast = useToast()

const { appTheme } = useAppTheme()
useHead({
    htmlAttrs: {
        class: [appTheme],
    },
})
useTitleApp('')

globalThis.$fetch = globalThis.$fetch.create({
    retry: false,
    onResponseError(response) {
        if (!response.response.ok) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: normalizeError(response),
                life: 3000,
            })
        }
    }
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
