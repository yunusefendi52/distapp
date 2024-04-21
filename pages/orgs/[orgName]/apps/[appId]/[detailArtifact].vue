<template>
    <div class="flex flex-row items-center justify-center h-12">
        <div class="flex-1">
            <h4 >{{ detailApp?.displayName }}</h4>
        </div>
        <Button label="Download" @click="download"></Button>
    </div>
    <div class="flex flex-col gap-3">
        <!-- <TabMenu v-model:active-index="active" :model="items" :pt="{
            menu: 'remove-bg-tabmenu',
            menuitem: 'remove-bg-tabmenu',
        }" />
        <div :style="{
            display: active == 0 ? 'unset' : 'none',
        }">
            <Releases :org-name="orgName" :app-name="appName" />
        </div>
        <div :style="{
            display: active == 1 ? 'unset' : 'none',
        }">
            <Groups :org-name="orgName" :app-name="appName" />
        </div> -->
    </div>
    <!-- {{ data }} -->


</template>

<script setup lang="ts">
const { params } = useRoute()
const appName = params.appId as string
const orgName = params.orgName as string
const releaseId = params.detailArtifact as string

const { data: detailApp } = useFetch('/api/detail-app', {
    query: {
        appName: appName,
        orgName: orgName,
    },
})

const { data } = useFetch('/api/artifacts/detail-artifact', {
    query: {
        appName: appName,
        orgName: orgName,
        releaseId: releaseId,
    },
})

const download = () => {
    const url = `/api/artifacts/download-artifact?fileObjectKey=${data.value?.fileObjectKey}`
    window.open(url, '_blank')
}
</script>