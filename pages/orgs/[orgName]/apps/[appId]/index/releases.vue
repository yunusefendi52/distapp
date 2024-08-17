<template>
    <Releases :org-name="orgName" :app-name="appName" />
</template>

<script setup lang="ts">
const { params } = useRoute()
const appName = params.appId as string
const orgName = params.orgName as string
</script>