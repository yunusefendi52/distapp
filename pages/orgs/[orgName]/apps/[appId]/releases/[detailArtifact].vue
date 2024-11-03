<template>
    <AppBarContainer>
        <div class="flex flex-row flex-1 gap-2 items-center">
            <AppTitle :title="detailApp?.displayName" />
            <div v-if="status === 'pending' || status2 === 'pending'">
                <ProgressSpinner style="width: 22px; height: 22px" strokeWidth="6" />
            </div>
        </div>
        <Button :loading="isDownloading" label="Download" @click="download"></Button>
    </AppBarContainer>
    <ConfirmPopup></ConfirmPopup>
    <!-- <div>{{ detailArtifact }}</div> -->
    <div class="card flex flex-col gap-3 m-4">
        <div class="flex flex-row items-center">
            <div class="flex flex-col gap-1 flex-1">
                <label class="font-semibold text-xl">Version {{ detailArtifact?.versionName2 }} ({{
                    detailArtifact?.releaseId
                    }})</label>
                <label class="text-lg">{{ formatDate(detailArtifact?.createdAt) }}</label>
            </div>
            <Button :loading="isPending" @click="confirmDelete($event)" icon="pi pi-trash" label="Delete"
                severity="danger" />
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
                <MultiSelect v-model="selectedGroup" display="chip" :options="groups"
                    :optionLabel="(w) => w.displayName || w.name" placeholder="Select Groups" />
                <Button class="ml-3" @click="() => saveGroups()" :loading="saveGroupsStatus == 'pending'"
                    label="Update Groups" />
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

const isDownloading = ref(false)

const download = async () => {
    let url = `/api/artifacts/download-artifact?appName=${appName}&orgName=${orgName}&releaseId=${releaseId}`
    if (isIosDevice()) {
        try {
            isDownloading.value = true
            url = `${url}&manifestPlist=true`
            const data = await $fetch(url, {
                query: {
                    manifestPlist: true,
                },
            })
            const manifestLink = generateManifestLink(data, releaseId, undefined)
            document.location = manifestLink
        } finally {
            isDownloading.value = false
        }
    } else {
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

const router = useRouter()

const { mutate, isPending } = useMutation({
    mutationFn: (r) => {
        return $fetch.raw('/api/artifacts/delete-artifact', {
            method: 'delete',
            query: {
                orgName,
                appName,
                releaseId,
            },
        })
    },
    onSuccess(data, variables, context) {
        router.back()
    },
})

const confirm = useConfirm();
const confirmDelete = (event: any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'Do you want to delete permanently this artifact?',
        icon: 'pi pi-info-circle',
        rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
        acceptClass: 'p-button-danger p-button-sm',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        accept: () => {
            mutate()
        },
        reject: () => {
        }
    });
};

</script>