<template>
    <div class="flex flex-col gap-3 mb-3 sm:flex-row">
        <Button :loading="!osType" @click="upload" outlined label="Upload"></Button>
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
</template>

<script setup lang="ts">
import AppFileUpload from './AppFileUpload.vue';
import { DataTableRowClickEvent } from 'primevue/datatable';

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

const dialog = useDialog();

const upload = () => {
    if (!props.osType) {
        return
    }

    dialog.open(AppFileUpload, {
        props: {
            modal: true,
            header: 'Upload',
            closeOnEscape: false,
        },
        data: {
            props,
            groupName: props.groupName,
        },
        onClose: (o) => {
            if (o?.data?.success) {
                refresh()
            }
        }
    })
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