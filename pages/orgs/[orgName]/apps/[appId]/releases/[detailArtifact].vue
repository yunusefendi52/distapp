<template>
    <ConfirmDialog></ConfirmDialog>
    <AppBarContainer>
        <div class="flex flex-row flex-1 gap-2 items-center">
            <NuxtLink :to="{
                name: 'orgs-orgName-apps-appId-index-releases',
                params: { orgName, appId: appName },
            }">
                <Button icon="pi pi-arrow-left" text rounded aria-label="Back to releases"
                    v-tooltip.top="'Back to releases'" data-testid="back_to_releases_btn" />
            </NuxtLink>
            <AppTitle :title="title" />
            <div v-if="status === 'pending' || status2 === 'pending'">
                <ProgressSpinner style="width: 22px; height: 22px" strokeWidth="6" />
            </div>
        </div>
    </AppBarContainer>

    <div class="flex-1 px-4 py-4 md:px-6">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 class="text-2xl font-bold">Release {{ releaseId }}</h1>
            <div class="flex flex-wrap gap-2">
                <Button :loading="isDownloading" :label="detailArtifact?.hasApk ? 'Download AAB' : 'Download'"
                    @click="() => download(releaseId, undefined, false)" data-testid="download_aab_btn" />
                <Button v-if="detailArtifact?.hasApk" :loading="isDownloading" label="Download APK"
                    @click="() => download(releaseId, undefined, true)" data-testid="download_apk_btn" />
                <Button type="button" icon="pi pi-ellipsis-v" outlined aria-label="Release actions"
                    aria-haspopup="true" aria-controls="overlay_menu" @click="toggle" data-testid="release_actions_btn" />
                <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" :pt="{
                    root: {
                        class: '!mt-3'
                    },
                }" />
            </div>
        </div>

        <div class="mt-4 rounded-md border border-[var(--p-content-border-color)]">
            <div class="flex flex-col gap-1 p-5 md:p-6">
                <div class="flex flex-wrap items-baseline gap-2">
                    <span class="text-2xl font-bold">Version {{ detailArtifact?.versionName2 || '-' }}</span>
                    <span class="text-xl text-[var(--p-text-muted-color)]">({{ detailArtifact?.versionCode2 || '-'
                        }})</span>
                </div>
                <span class="text-base text-[var(--p-text-muted-color)]">Uploaded: {{ uploaded }}</span>
            </div>

            <AppDivider orientation="horizontal" />

            <div class="flex flex-col gap-5 p-5 md:p-6">
                <section class="flex flex-col gap-2">
                    <h2 class="text-base font-semibold">Groups</h2>
                    <MultiSelect class="w-full max-w-md" v-model="selectedGroup" display="chip" :options="groups"
                        :optionLabel="(w) => w.displayName || w.name" placeholder="Select groups" filter
                        @change="saveGroupsDebounced()" data-testid="groups_multiselect" />
                    <span v-if="saveGroupsStatus === 'pending'" class="text-xs text-[var(--p-text-muted-color)]">Saving
                        changes…</span>
                    <span v-else-if="saveGroupsStatus === 'error'" class="text-xs text-red-500">Could not save groups.
                        Try again.</span>
                    <span v-if="!groups.length" class="text-sm text-[var(--p-text-muted-color)]">
                        No groups yet.
                        <NuxtLink :to="{
                            name: 'orgs-orgName-apps-appId-index-groups',
                            params: { orgName, appId: appName },
                        }" class="underline">Create a group</NuxtLink>
                        to start sharing this build.
                    </span>
                </section>

                <section class="flex flex-col gap-1">
                    <h2 class="text-base font-semibold">Platform</h2>
                    <PlatformBadge :osType="detailApp?.osType" />
                </section>

                <section class="flex flex-col gap-1">
                    <h2 class="text-base font-semibold">File metadata</h2>
                    <span class="text-base">File Extension: {{ detailArtifact?.extension || '-' }}</span>
                    <span class="text-base">File Size: {{ formatBytes(detailArtifact?.fileMetadata?.contentLength) ||
                        '-'
                        }}</span>
                </section>

                <section class="flex flex-col gap-1">
                    <div class="flex items-center gap-1">
                        <h2 class="text-base font-semibold">Release notes</h2>
                        <Button icon="pi pi-pencil" text rounded size="small" aria-label="Edit release notes"
                            v-tooltip.top="'Edit release notes'" @click="showEdit = true"
                            data-testid="edit_release_btn" />
                    </div>
                    <p v-if="detailArtifact?.releaseNotes" class="whitespace-pre-wrap text-base leading-relaxed">{{
                        detailArtifact.releaseNotes }}</p>
                    <p v-else class="text-base text-[var(--p-text-muted-color)]">No release notes for this build.</p>
                </section>
            </div>
        </div>
    </div>

    <div v-if="showEdit">
        <DialogEditArtifact v-model="showEdit" :release-notes="detailArtifact?.releaseNotes ?? ''"
            @on-edited="refreshData" />
    </div>
</template>

<script setup lang="ts">
import { formatBytes } from '#imports'
import { useDebounceFn } from '@vueuse/core'
import { UpdateGroupsRequest } from '~/server/api/update-artifact-groups.put';
import { MenuItem } from '#imports'
import { PlatformBadge } from '#components';

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

const uploaded = computed(() => {
    const value = detailArtifact.value?.createdAt
    return value
        ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : '-'
})

const { download, isDownloading } = useDownloadArtifact(appName, orgName)

const { data: appGroups } = useFetch('/api/groups/list-groups', {
    query: {
        appName: appName,
        orgName: orgName,
    },
})
const groups = computed(() => appGroups.value ?? [])
const selectedGroup = ref<typeof groups.value>()
watchEffect(() => {
    selectedGroup.value = detailArtifact.value?.groups.map(e => e.artifactsGroups) ?? []
})
const { execute: saveGroups, status: saveGroupsStatus } = useAsyncData(() => {
    return $fetch.raw('/api/update-artifact-groups', {
        body: {
            artifactId: detailArtifact.value?.id ?? '',
            orgName: orgName,
            appName: appName,
            groupNames: selectedGroup.value?.map(e => e.name) ?? [],
        } satisfies UpdateGroupsRequest,
        method: 'put',
        onResponse: () => {
            refresh()
        },
    })
}, {
    immediate: false,
})

const saveGroupsDebounced = useDebounceFn(() => saveGroups(), 350)

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
        label: 'Delete release',
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
