<template>
    <AppHeader />
    <div class="flex flex-col items-center">
        <div v-if="pending">
            <ProgressSpinner style="width: 50px; height: 50px; margin: unset;" strokeWidth="6" />
        </div>
        <div class="container flex flex-col gap-5 p-3" v-else>
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
                            <Button label="Download" @click="download(item.releaseId)" />
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
definePageMeta({
    layout: false,
    server: false,
})

const route = useRoute()
const { value: { publicId } } = computed(() => route.params)

const { data, pending } = useFetch('/api/install/get-data', {
    query: {
        publicId,
    },
    server: false,
})

useSeoMeta({
    title: `DistApp - ${data.value?.app.name ?? ''}`,
})

const download = (releaseId: number) => {
    if (isIosDevice()) {
        const url = generateManifestLink({}, releaseId.toString(), publicId.toString())
        document.location = url
    } else {
        const url = `/api/install/download?publicId=${publicId}&releaseId=${releaseId}`
        window.open(url, '_blank')
    }
}
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