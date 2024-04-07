<script setup lang="ts">
import 'primevue/resources/themes/aura-dark-green/theme.css'
const { finish: finishNuxtLoading } = useLoadingIndicator()
finishNuxtLoading()
if (process.client) {
    finishNuxtLoading()
}
</script>

<template>
    <NuxtLoadingIndicator />
    <NuxtLayout>
        <NuxtPage />
        <DynamicDialog />
    </NuxtLayout>
</template>

<style lang="scss">
html,
body,
#__nuxt {
    margin: 0px;
    height: 100%;
}
</style>
