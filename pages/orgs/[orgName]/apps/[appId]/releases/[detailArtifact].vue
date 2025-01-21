<template>
    <ConfirmDialog></ConfirmDialog>
    <AppBarContainer>
        <div class="flex flex-row flex-1 gap-2 items-center">
            <AppTitle :title="title" />
            <div v-if="status === 'pending' || status2 === 'pending'">
                <ProgressSpinner style="width: 22px; height: 22px" strokeWidth="6" />
            </div>
        </div>
    </AppBarContainer>
    <div class="flex flex-row gap-1 flex-1 p-4 items-center">
        <span class="text-xl font-medium flex-1">Release {{ detailArtifact?.releaseId }}</span>
        <div class="flex flex-col gap-2 items-stretch md:items-end">
            <div class="flex flex-row gap-2">
                <Button :loading="isDownloading" :label="detailArtifact?.hasApk ? `Download AAB` : `Download`"
                    @click="() => download(releaseId, undefined, false)" size="small"></Button>
                <Button :loading="isDownloading" label="Download APK" v-if="detailArtifact?.hasApk"
                    @click="() => download(releaseId, undefined, true)" size="small"></Button>
                <Button type="button" icon="pi pi-ellipsis-v" @click="toggle" aria-haspopup="true"
                    aria-controls="overlay_menu" size=small />
                <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" :pt="{
                    root: {
                        class: '!mt-3'
                    },
                }" />
            </div>
        </div>
    </div>
    <div class="card flex flex-col gap-3 mx-4 mb-4" style="white-space: break-spaces;">
        <div class="flex flex-col md:flex-row items-stretch gap-2">
            <div class="flex flex-col gap-1 flex-1">
                <!-- <span class="text-sm">Release Id {{ detailArtifact?.releaseId }}</span> -->
                <span class="font-semibold text-xl">Version {{ detailArtifact?.versionName2 }} ({{
                    detailArtifact?.versionCode2
                    }})</span>
                <span class="text-lg">{{ formatDate(detailArtifact?.createdAt) }}</span>
            </div>
        </div>
        <div class="flex flex-col gap-2">
            <span class="font-semibold">Downloads</span>
            <span>{{ '-' }}</span>
        </div>
        <div class="flex flex-col gap-2">
            <span class="font-semibold">Groups</span>
            <div class="flex flex-col md:flex-row gap-2 items-center">
                <MultiSelect class="w-full md:max-w-[24rem]" v-model="selectedGroup" display="chip" :options="groups"
                    :optionLabel="(w) => w.displayName || w.name" placeholder="Select Groups" filter />
                <Button class="w-full md:w-[11rem]" @click="() => saveGroups()" :loading="saveGroupsStatus == 'pending'"
                    label="Update Groups" outlined />
            </div>
        </div>
        <div class="flex flex-col gap-2">
            <span class="font-semibold">File metadata</span>
            <div class="flex flex-col">
                <!-- <span>{{ `MD5: ${detailArtifact?.fileMetadata?.md5?.replaceAll('"', '')}` }}</span> -->
                <span>{{ `File Extension: ${detailArtifact?.extension}`
                    }}</span>
                <span>{{ `File Size: ${formatBytes(detailArtifact?.fileMetadata?.contentLength) || 'n/a'}` }}</span>
            </div>
        </div>
        <div class="flex flex-col gap-2">
            <span class="font-semibold">Release Notes</span>
            <span>{{ detailArtifact?.releaseNotes || '-' }}</span>
        </div>
    </div>
    <div v-if="showEdit">
        <DialogEditArtifact v-model="showEdit" :release-notes="detailArtifact?.releaseNotes ?? ''"
            @on-edited="refreshData" />
    </div>
</template>

<script setup lang="ts">
import { formatDate, formatBytes } from '#imports'
import { UpdateGroupsRequest } from '~/server/api/update-artifact-groups.put';
import { MenuItem } from '#imports'

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

const { download, isDownloading } = useDownloadArtifact(appName, orgName)

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
    return $fetch.raw('/api/update-artifact-groups', {
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

const isActive = ref(false)

onMounted(() => {
    isActive.value = true
})
onUnmounted(() => {
    isActive.value = false
})

const { mutate: deleteArtifactApi, isPending } = useMutation({
    mutationFn: (r) => {
        return $fetch.raw('/api/artifacts/delete-artifact', {
            method: 'post',
            query: {
                orgName,
                appName,
                releaseId,
            },
        })
    },
    onSuccess(data, variables, context) {
        if (isActive.value) {
            router.replace({
                name: 'orgs-orgName-apps-appId-index-releases',
                params: {
                    orgName: orgName,
                    appId: appName,
                },
            })
        }
    },
})

const confirm = useConfirm();
const confirmDelete = (event: any) => {
    confirm.require({
        blockScroll: true,
        header: 'Confirmation',
        message: 'Do you want to delete permanently this artifact?',
        icon: 'pi pi-info-circle',
        rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
        acceptClass: 'p-button-danger p-button-sm',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        accept: () => {
            deleteArtifactApi()
        },
        reject: () => {
        }
    });
};

const menu = ref()
const items = ref<MenuItem[]>([
    {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => {
            showEdit.value = true
        },
    },
    {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: (event: MenuItemCommandEvent) => {
            confirmDelete(event.originalEvent)
        },
    },
])

const toggle = (event: Event) => {
    menu.value.toggle(event)
}

const showEdit = ref(false)

const refreshData = () => {
    refresh()
}

const title = useTitleApp(computed(() => detailApp.value?.displayName))
</script>