<template>
    <Button @click="upload" label="Upload" class="mb-3"></Button>
    <DataTable :value="list" single @row-click="selectRow($event)">
        <Column field="releaseId" header="Release Id" style="width: 15%"></Column>
        <Column field="versionName2" header="Version Name"></Column>
        <Column field="versionCode2" header="Version Code"></Column>
        <Column field="createdAt" header="Date">
            <template #body="slotProps">
                <label v-tooltip.bottom="{
        value: moment(slotProps.data.createdAt).format(),
    }">
                    {{ moment(slotProps.data.createdAt).fromNow() }}
                </label>
            </template>
        </Column>
    </DataTable>
</template>

<script setup lang="ts">
import moment from 'moment'
import AppFileUpload from './AppFileUpload.vue';
import { DataTableRowClickEvent } from 'primevue/datatable';

const props = defineProps<{
    orgName: string,
    appName: string,
}>()

const { data, refresh } = await useFetch('/api/artifacts/list-artifacts', {
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

const selectRow =async  (row: DataTableRowClickEvent) => {
    console.log(row.data)
    await navigateTo(`${props.appName}/${row.data.releaseId}`)
}
</script>