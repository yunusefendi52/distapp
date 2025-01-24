<template>
    <Button label="Download" @click="download(releaseId, publicId.toString(), true)" :loading="isDownloading" />
</template>

<script setup lang="ts">
defineProps<{
    releaseId: string,
}>()

const route = useRoute()
const { value: { publicId, orgName, appName } } = computed(() => route.params)

const { download, isDownloading } = useDownloadArtifact(appName.toString(), orgName.toString())
</script>