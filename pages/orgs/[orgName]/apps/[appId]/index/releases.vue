<template>
    <Releases :org-name="orgName" :app-name="appName" :os-type="osType" />
</template>

<script setup lang="ts">
const { params } = useRoute()
const attrs = useAttrs()
const osType = computed(() => attrs.osType as 'android' | 'ios' | null | undefined)
const appName = params.appId as string
const orgName = params.orgName as string
</script>