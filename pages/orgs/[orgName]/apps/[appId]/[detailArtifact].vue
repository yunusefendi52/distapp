<template>
    {{ data }}

    <Button label="Download" @click="download"></Button>
</template>

<script setup lang="ts">
const { params } = useRoute()
const appName = params.appId as string
const orgName = params.orgName as string
const releaseId = params.detailArtifact as string

const { data } = await useFetch('/api/artifacts/detail-artifact', {
    query: {
        appName: appName,
        orgName: orgName,
        releaseId: releaseId,
    },
})

const download = () => {
    const url = `/api/artifacts/download-artifact?fileObjectKey=${data.value?.fileObjectKey}`
    console.log(url)
    window.open(url, '_blank')
}
</script>