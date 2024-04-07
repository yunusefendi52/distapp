<template>
    <AppFileUpload :onOnUpload="onUpload" />

    <DataTable :value="list">
        <Column field="versionName" header="Version Name"></Column>
        <Column field="versionCode" header="Version Code"></Column>
        <Column field="createdAt" header="Date">
            <template #body="slotProps">
                <label v-tooltip.bottom="{
                        value: moment(slotProps.data.createdAt).format(),
                    }">
                    {{ moment(slotProps.data.createdAt).fromNow() }}
                </label>
            </template>
        </Column>
        <!-- <Column field="category" header="Category"></Column>
        <Column field="quantity" header="Quantity"></Column> -->
    </DataTable>
</template>

<script setup lang="ts">
import moment from 'moment'

const props = defineProps<{
    orgName: string,
    appName: string,
}>()

const onUpload = async (file: File, resolve: (value: unknown) => void, reject: (value: any) => void) => {
    try {
        const { url, file: key } = await $fetch('/api/artifacts/upload-artifact', {
            method: 'post',
        })
        await $fetch(url, {
            method: 'put',
            body: file,
            redirect: "follow",
        })
        await $fetch('/api/artifacts/upload-artifact-url', {
            method: 'post',
            body: {
                key: key,
                ...props,
            },
        })
        resolve(null)
    } catch (e) {
        reject(e)
    }
};

const { data, refresh } = await useFetch('/api/artifacts/list-artifacts')
const list = computed(() => data.value as any[])

provide('refresh-list-artifacts', refresh)
</script>