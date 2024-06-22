<template>
    <div class="flex flex-col gap-3 mb-3 sm:flex-row">
        <Button @click="upload" label="Upload"></Button>
        <MultiSelect placeholder="Filter Groups" v-model="selectedGroup" :options="groups" optionLabel="name"
            class="sm:w-[200px]" />
    </div>
    <div class="card p-0">
        <DataTable scrollable :value="list" single @row-click="selectRow($event)" selectionMode="single">
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
            <Column field="createdAt" header="Date">
                <template #body="slotProps">
                    <label>
                        {{ formatDate(slotProps.data.createdAt) }}
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
}>()

const { data: appGroups } = useFetch('/api/groups/list-groups', {
    query: {
        appName: props.appName,
        orgName: props.orgName,
    },
})
const groups = computed(() => appGroups.value ?? [])
const selectedGroup = ref<any[]>([])
const selectedGroupIds = computed(() => selectedGroup.value?.map(e => e.id) ?? [])

const { data, refresh } = useFetch('/api/artifacts/list-artifacts', {
    query: {
        orgName: props.orgName,
        appName: props.appName,
        groups: selectedGroupIds,
    },
})
const list = computed(() => data.value as any[])

const dialog = useDialog();

const osType = inject<ComputedRef<OsType>>('detail-app')

const upload = () => {
    dialog.open(AppFileUpload, {
        props: {
            modal: true,
            header: 'Upload',
        },
        data: {
            osType,
            props,
        },
        onClose: (o) => {
            if (o?.data?.success) {
                refresh()
            }
        }
    })
}

const selectRow = async (row: DataTableRowClickEvent) => {
    console.log(row.data)
    await navigateTo(`/orgs/${props.orgName}/apps/${props.appName}/${row.data.artifacts.releaseId}`)
}

</script>