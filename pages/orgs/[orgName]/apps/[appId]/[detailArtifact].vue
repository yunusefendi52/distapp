<template>
    <div class="flex flex-row items-center justify-center h-12">
        <div class="flex-1">
            <h4>{{ detailApp?.displayName }}</h4>
        </div>
        <Button label="Download" @click="download"></Button>
    </div>
    <!-- <div>{{ detailArtifact }}</div> -->
    <div class="flex flex-col gap-3 mt-3 card p-3">
        <div class="flex flex-col gap-1">
            <label class="font-semibold text-xl">Version {{ detailArtifact?.versionName2 }} ({{
                detailArtifact?.releaseId
            }})</label>
            <label class="text-lg">{{ formatDate(detailArtifact?.createdAt) }}</label>
        </div>
        <div class="flex flex-col gap-2">
            <span class="font-semibold">Release Notes</span>
            <label>{{ detailArtifact?.releaseNotes ?? '-' }}</label>
        </div>
        <div class="flex flex-col gap-2">
            <span class="font-semibold">Downloads</span>
            <label>{{ '-' }}</label>
        </div>
        <div class="flex flex-col gap-2">
            <span class="font-semibold">Groups</span>
            <label>{{ '-' }}</label>
        </div>
        <div class="flex flex-col gap-2">
            <span class="font-semibold">File metadata</span>
            <div class="flex flex-col">
                <label>{{ `MD5: ${detailArtifact?.fileMetadata?.md5?.replaceAll('"', '')}` }}</label>
                <label>{{ `File Extension: ${getExtensionFromMimeType(detailArtifact?.fileMetadata?.contentType)}` }}</label>
                <label>{{ `File Size: ${formatBytes(detailArtifact?.fileMetadata?.contentLength ?? 0)}` }}</label>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'

const { params } = useRoute()
const appName = params.appId as string
const orgName = params.orgName as string
const releaseId = params.detailArtifact as string

const { data: detailApp } = useFetch('/api/detail-app', {
    query: {
        appName: appName,
        orgName: orgName,
    },
})

const { data: detailArtifact } = useFetch('/api/artifacts/detail-artifact', {
    query: {
        appName: appName,
        orgName: orgName,
        releaseId: releaseId,
    },
})

const download = () => {
    const url = `/api/artifacts/download-artifact?fileObjectKey=${detailArtifact.value?.fileObjectKey}`
    window.open(url, '_blank')
}


</script>