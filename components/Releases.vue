<template>
    <Button @click="upload" label="Upload" class="mb-3"></Button>
    <div class="card p-0">
        <DataTable :value="list" single @row-click="selectRow($event)" selectionMode="single">
            <Column field="releaseId" header="Release Id" style="width: 15%"></Column>
            <Column field="versionName2" header="Version Name"></Column>
            <Column field="versionCode2" header="Version Code"></Column>
            <Column field="groups" header="Groups">
                <template #body="slotProps">
                    <label>
                        {{ formatGroups(slotProps.data.groups) }}
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

const { data, refresh } = useFetch('/api/artifacts/list-artifacts', {
    query: {
        orgName: props.orgName,
        appName: props.appName,
    },
})
const list = computed(() => data.value as any[])

const dialog = useDialog();

const osType = inject<OsType>('detail-app')

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
    await navigateTo(`/orgs/${props.orgName}/apps/${props.appName}/${row.data.releaseId}`)
}
</script>