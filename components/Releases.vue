<template>
    <div class="flex flex-col gap-3 mb-3 sm:flex-row">
        <Button data-testid="d_upload" :loading="!osType" @click="upload" label="Upload"></Button>
        <MultiSelect v-if="!groupName" placeholder="Filter Groups" v-model="selectedGroup" :options="groups"
            :optionLabel="(w) => w.displayName || w.name" class="sm:w-[200px]" filter />
    </div>
    <div>
        <DataTable :show-gridlines="false" scrollable :value="list" single @row-click="selectRow($event)"
            selectionMode="single">
            <Column field="artifacts.releaseId" header="Release Id" style="width: 15%"></Column>
            <Column field="artifacts.versionName2" header="Version">
                <template #body="slotProps">
                    <label>
                        {{ `${slotProps.data.artifacts.versionName2} (${slotProps.data.artifacts.versionCode2})` }}
                    </label>
                </template>
            </Column>
            <Column header="Groups">
                <template #body="slotProps">
                    <label>
                        {{ slotProps.data.groups.names ?? '-' }}
                    </label>
                </template>
            </Column>
            <Column header="Date">
                <template #body="slotProps">
                    <label>
                        {{ formatDate(slotProps.data.artifacts.createdAt) }}
                    </label>
                </template>
            </Column>
            <template #empty>
                <div class="flex items-center justify-center">
                    <label>No data found</label>
                </div>
            </template>
        </DataTable>
    </div>
    <AppFileUpload v-model="showUpload" :dataProps="props" @on-success="() => {
        showUpload = false
        refresh()
    }" />
</template>

<script setup lang="ts">
import AppFileUpload from './AppFileUpload.vue';
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

const { data, refresh } = useFetch('/api/artifacts/list-artifacts', {
    query: {
        orgName: props.orgName,
        appName: props.appName,
        groups: selectedGroupIds,
        groupName: props.groupName,
    },
})
const list = computed(() => data.value)

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