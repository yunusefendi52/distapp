<template>
    <div class="flex flex-col gap-3 mb-3 sm:flex-row">
        <Button data-testid="d_upload" :loading="!osType" @click="upload" label="New Release"></Button>
        <MultiSelect v-if="!groupName" placeholder="Filter Groups" v-model="selectedGroup" :options="groups"
            :optionLabel="(w) => w.displayName || w.name" class="sm:w-[200px]" filter />
    </div>
    <div>
        <DataTable :show-gridlines="false" scrollable :value="list" single @row-click="selectRow($event)"
            selectionMode="single" dataKey="artifacts.releaseId">
            <Column field="artifacts.releaseId" header="Release Id" style="width: 15%"></Column>
            <Column field="artifacts.versionName2" header="Version">
                <template #body="slotProps">
                    <span>
                        {{ `${slotProps.data.artifacts.versionName2} (${slotProps.data.artifacts.versionCode2})` }}
                    </span>
                </template>
            </Column>
            <Column header="Groups">
                <template #body="slotProps">
                    <span>
                        {{ slotProps.data.groups.names ?? '-' }}
                    </span>
                </template>
            </Column>
            <Column header="Uploaded">
                <template #body="slotProps">
                    <ClientOnly>
                        <span v-tooltip="{ value: slotProps.data.artifacts.createdAt, showDelay: 1250 }">
                            {{ formatDate(slotProps.data.artifacts.createdAt) }}
                        </span>
                    </ClientOnly>
                </template>
            </Column>
            <template #empty>
                <div class="flex items-center justify-center">
                    <span>No data found</span>
                </div>
            </template>
        </DataTable>
        <!-- Paginator Wrapper -->
        <div class="flex flex-row justify-center items-center">
            <Paginator v-model:first="first" v-model:rows="pageSize" :totalRecords="total"
                :pt="{
                    root: '!bg-[unset]',
                }"
                template="FirstPageLink PrevPageLink NextPageLink RowsPerPageDropdown" :rowsPerPageOptions="[10, 20, 50]"
                @page="onPage" />
            <div class="h-[22px] w-[22px] m-[unset]">
                <ProgressSpinner class="!h-[22px] !w-[22px]" strokeWidth="6" v-if="status ==='pending'" />
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

const selectRow = async (row: DataTableRowClickEvent) => {
    await navigateTo({
        name: 'orgs-orgName-apps-appId-releases-detailArtifact',
        params: {
            detailArtifact: row.data.artifacts.releaseId,
        },
    })
}
</script>