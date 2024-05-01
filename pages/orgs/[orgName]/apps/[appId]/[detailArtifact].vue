<template>
    <div class="flex flex-row items-center justify-center h-12">
        <div class="flex flex-row flex-1 gap-2 items-center">
            <h4>{{ detailApp?.displayName }}</h4>
            <div v-if="status === 'pending' || status2 === 'pending'">
                <ProgressSpinner style="width: 22px; height: 22px" strokeWidth="6" />
            </div>
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
            <div class="flex flex-row">
                <MultiSelect v-model="selectedGroup" display="chip" :options="groups" optionLabel="name"
                    placeholder="Select Groups" />
                <Button class="ml-3" @click="() => saveGroups()" :loading="saveGroupsStatus == 'pending'"
                    label="Save Groups" />
            </div>
        </div>
        <div class="flex flex-col gap-2">
            <span class="font-semibold">File metadata</span>
            <div class="flex flex-col">
                <label>{{ `MD5: ${detailArtifact?.fileMetadata?.md5?.replaceAll('"', '')}` }}</label>
                <label>{{ `File Extension: ${detailArtifact?.extension}`
                    }}</label>
                <label>{{ `File Size: ${formatBytes(detailArtifact?.fileMetadata?.contentLength ?? 0)}` }}</label>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { UpdateGroupsRequest } from '~/server/api/update-artifact-groups.put';

const { params } = useRoute()
const appName = params.appId as string
const orgName = params.orgName as string
const releaseId = params.detailArtifact as string

const { data: detailApp, status } = useFetch('/api/detail-app', {
    query: {
        appName: appName,
        orgName: orgName,
    },
})

const { data: detailArtifact, refresh, status: status2 } = useFetch('/api/artifacts/detail-artifact', {
    query: {
        appName: appName,
        orgName: orgName,
        releaseId: releaseId,
    },
})

const download = () => {
    if (isIosDevice()) {
        const url = generateManifestLink(appName, orgName, releaseId, undefined)
        document.location = url
    } else {
        const url = `/api/artifacts/download-artifact?appName=${appName}&orgName=${orgName}&releaseId=${releaseId}`
        window.open(url, '_blank')
    }
}

const { data: appGroups } = useFetch('/api/groups/list-groups', {
    query: {
        appName: appName,
        orgName: orgName,
    },
})
const groups = computed(() => appGroups.value ?? [])
const selectedGroup = ref<any[]>()
watchEffect(() => {
    selectedGroup.value = detailArtifact.value?.groups.map(e => e.artifactsGroups) ?? []
})
const { execute: saveGroups, status: saveGroupsStatus } = useAsyncData(() => {
    return $fetch('/api/update-artifact-groups', {
        body: {
            artifactId: detailArtifact.value?.id ?? '',
            groupIds: selectedGroup.value?.map(e => e.id) ?? [],
        } satisfies UpdateGroupsRequest,
        method: 'put',
        onResponse: () => {
            refresh()
        },
    })
}, {
    immediate: false,
})

</script>