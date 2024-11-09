<template>
    <div class="flex flex-row gap-1 items-center">
        <AppHeader class="flex-auto" />
        <div class="flex flex-row gap-2 px-3">
            <Button v-if="cookie" label="Sign Out" outlined />
            <Button v-else label="Sign In" outlined />
        </div>
    </div>
    <div class="flex flex-col items-center">
        <div v-if="status === 'pending'">
            <ProgressSpinner style="width: 50px; height: 50px; margin: unset;" strokeWidth="6" />
        </div>
        <div class="container flex flex-col gap-5 p-5" v-else>
            <div class="flex flex-col justify-start gap-3">
                <span class=" text-4xl">{{ data?.app.displayName }}</span>
                <div class="flex justify-start gap-2">
                    <Badge :value="data?.app.osType === 'ios' ? 'iOS' : 'Android'" severity="info" />
                    <Badge :value="data?.org.displayName" severity="info" />
                    <Badge :value="data?.artifactGroup.name" severity="info" />
                </div>
            </div>
            <Panel v-for="item in data?.artifacts.map(e => e.artifacts!)" :key="item.id">
                <template #header>
                    <div class="flex flex-row w-full">
                        <div class="flex-1 flex flex-col gap-1">
                            <a :name="item.releaseId" :href="'#' + item.releaseId" class="font-semibold text-lg">Version
                                {{
                                    item.versionName2 }}
                                ({{
                                    item.releaseId
                                }})</a>
                            <span>{{ formatDate(item.createdAt) }}</span>
                            <!-- <span>30mbbb</span> -->
                        </div>
                        <div>
                            <Button label="Download" @click="download(item.releaseId.toString(), publicId.toString())"
                                :loading="isDownloading" />
                        </div>
                    </div>
                </template>
                <template #default>
                    <div v-if="item.releaseNotes">
                        {{ item.releaseNotes }}
                    </div>
                    <div v-else>
                        -
                    </div>
                </template>
            </Panel>
        </div>
    </div>
</template>

<script setup lang="ts">
import { formatDate } from '#imports'

definePageMeta({
    layout: false,
    server: false,
    path: '/install/:orgName/apps/:appName/:publicId',
})

const route = useRoute()
const { value: { publicId, orgName, appName } } = computed(() => route.params)

const { data, status } = useFetch('/api/install/get-data', {
    query: {
        publicId,
        orgName,
        appName,
    },
    server: false,
})

useSeoMeta({
    title: `DistApp - ${data.value?.app.name ?? ''}`,
})

const { download, isDownloading } = useDownloadArtifact(appName.toString(), orgName.toString())

const cookie = useCookie('app-auth')
</script>

<style scoped>
.container {
    width: 100%;
}

@media only screen and (min-width: 600px) {
    .container {
        width: 576px;
    }
}
</style>