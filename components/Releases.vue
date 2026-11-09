<template>
    <div class="mb-3 flex flex-col gap-3 sm:flex-row">
        <Button data-testid="d_upload" :loading="!osType" @click="upload" label="New Release"></Button>
        <MultiSelect v-if="!groupName" placeholder="Filter Groups" v-model="selectedGroup" :options="groups"
            :optionLabel="(w) => w.displayName || w.name" class="sm:w-[200px]" filter />
    </div>

    <div v-if="status === 'pending' && !list?.length" class="flex justify-center py-10">
        <ProgressSpinner style="width: 24px; height: 24px" strokeWidth="6" />
    </div>

    <div v-else>
        <DataTable :show-gridlines="false" scrollable :value="list" single @row-click="selectRow"
            selectionMode="single" dataKey="artifacts.releaseId">
            <Column header="Version" class="whitespace-nowrap">
                <template #body="slotProps">
                    <div class="flex flex-col">
                        <span class="font-semibold">
                            {{ slotProps.data.artifacts.versionName2 }}
                            <span class="font-normal text-[var(--p-text-muted-color)]">
                                ({{ slotProps.data.artifacts.versionCode2 }})
                            </span>
                        </span>
                        <span class="text-xs text-[var(--p-text-muted-color)]">
                            Release #{{ slotProps.data.artifacts.releaseId }}
                            <span class="sm:hidden"> · {{ formatDate(slotProps.data.artifacts.createdAt) }}</span>
                        </span>
                    </div>
                </template>
            </Column>
            <Column header="Groups">
                <template #body="slotProps">
                    <div class="flex flex-wrap items-center gap-1">
                        <template v-if="groupNamesFor(slotProps.data).length">
                            <span v-for="name in groupNamesFor(slotProps.data)" :key="name"
                                class="rounded-full bg-[var(--p-surface-200)] px-2 py-0.5 text-xs dark:bg-[var(--p-surface-700)]">
                                {{ name }}
                            </span>
                        </template>
                        <span v-else class="text-[var(--p-text-muted-color)]">—</span>
                    </div>
                </template>
            </Column>
            <Column header="Uploaded" class="hidden whitespace-nowrap sm:table-cell">
                <template #body="slotProps">
                    <ClientOnly>
                        <span v-tooltip="{ value: slotProps.data.artifacts.createdAt, showDelay: 1250 }">
                            {{ formatDate(slotProps.data.artifacts.createdAt) }}
                        </span>
                    </ClientOnly>
                </template>
            </Column>
            <Column header="" style="width: 5.5rem">
                <template #body="slotProps">
                    <div class="flex items-center justify-end gap-1">
                        <Button icon="pi pi-download" text rounded size="small" aria-label="Download release"
                            v-tooltip.top="'Download'"
                            :loading="downloadingId === slotProps.data.artifacts.releaseId"
                            @click.stop="onDownload(slotProps.data)" />
                        <i class="pi pi-chevron-right text-xs text-[var(--p-text-muted-color)]" aria-hidden="true" />
                    </div>
                </template>
            </Column>
            <template #empty>
                <div class="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <i class="pi pi-inbox text-3xl text-[var(--p-text-muted-color)]" />
                    <div class="flex flex-col gap-1">
                        <span class="font-semibold">{{ selectedGroupIds.length ? 'No releases match these groups'
                            : 'No releases yet' }}</span>
                        <span class="text-sm text-[var(--p-text-muted-color)]">{{ selectedGroupIds.length
                            ? 'Try clearing the group filter.'
                            : 'Upload your first build to get started.' }}</span>
                    </div>
                    <Button v-if="!selectedGroupIds.length" label="New Release" :loading="!osType" @click="upload" />
                </div>
            </template>
        </DataTable>

        <div v-if="total > pageSize" class="flex flex-row justify-center items-center">
            <Paginator v-model:first="first" v-model:rows="pageSize" :totalRecords="total" :pt="{
                root: '!bg-[unset]',
            }" template="FirstPageLink PrevPageLink NextPageLink RowsPerPageDropdown"
                :rowsPerPageOptions="[10, 20, 50]" @page="onPage" />
            <div class="h-[22px] w-[22px] m-[unset]">
                <ProgressSpinner class="!h-[22px] !w-[22px]" strokeWidth="6" v-if="status === 'pending'" />
            </div>
        </div>
    </div>

    <AppFileUpload v-model="showUpload" :dataProps="props" @on-success="() => {
        showUpload = false
        refresh()
    }" />
</template>

<script setup lang="ts">
import { DataTableRowClickEvent } from 'primevue/datatable';
import { formatDate } from '#imports';

const props = defineProps<{
    orgName: string,
    appName: string,
    osType: 'android' | 'ios' | null | undefined,
    groupName?: string | undefined,
}>()

const { data: appGroups } = useFetch('/api/groups/list-groups', {
    query: {
        appName: props.appName,
        orgName: props.orgName,
    },
})
const groups = computed(() => appGroups.value ?? [])
const selectedGroup = ref<typeof appGroups.value>([])
const selectedGroupIds = computed(() => selectedGroup.value?.map(e => e.id) ?? [])

const UNKNOWN_TOTAL = Number.MAX_SAFE_INTEGER
const first = ref(0)
const pageSize = useLocalStorage('releases-page-size', 50)
const page = ref(1)
const total = ref(UNKNOWN_TOTAL)
const onPage = () => {
    page.value = first.value / pageSize.value + 1
}

const { data, refresh, status } = useFetch('/api/artifacts/list-artifacts', {
    query: {
        orgName: props.orgName,
        appName: props.appName,
        groups: selectedGroupIds,
        groupName: props.groupName,
        page,
        pageSize,
    },
})
const list = computed(() => data.value)

watchEffect(() => {
    if (status.value !== 'success') return
    const rows = data.value?.length
    if (rows != null && rows < pageSize.value) {
        total.value = (page.value - 1) * pageSize.value + rows
    }
})
watch(pageSize, () => {
    total.value = UNKNOWN_TOTAL
})
watch(selectedGroupIds, () => {
    page.value = 1
    first.value = 0
    total.value = UNKNOWN_TOTAL
})

const showUpload = ref(false)
const upload = () => {
    if (!props.osType) {
        return
    }
    showUpload.value = true
}

const { download } = useDownloadArtifact(props.appName, props.orgName)
const downloadingId = ref<string | null>(null)

const onDownload = async (row: any) => {
    const releaseId = row.artifacts.releaseId
    downloadingId.value = releaseId
    try {
        await download(releaseId, undefined, false)
    } finally {
        downloadingId.value = null
    }
}

const selectRow = async (row: DataTableRowClickEvent) => {
    await navigateTo({
        name: 'orgs-orgName-apps-appId-releases-detailArtifact',
        params: {
            detailArtifact: row.data.artifacts.releaseId,
        },
    })
}

const groupNamesFor = (row: any): string[] => {
    const names = row?.groups?.names
    if (!names) return []
    return String(names).split(',').map(name => name.trim()).filter(Boolean)
}
</script>

<style scoped>
:deep(.p-datatable-tbody > tr) {
    cursor: pointer;
}
</style>
