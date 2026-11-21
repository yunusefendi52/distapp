<template>
    <Button label="Download" @click="download(releaseId, publicId.toString(), true, secureLink?.toString())"
        :loading="isDownloading" />
</template>

<script setup lang="ts">
defineProps<{
    releaseId: string,
}>()

const route = useRoute()
const { value: { publicId, orgName, appName, secureLink } } = computed(() => route.params)

const { download, isDownloading } = useDownloadArtifact(appName.toString(), orgName.toString())
</script>