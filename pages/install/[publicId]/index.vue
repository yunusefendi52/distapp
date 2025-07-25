<template>
    <div class="flex flex-col items-center">
        <div v-if="status === 'idle' || status === 'pending'">
            <ProgressSpinner style="width: 50px; height: 50px; margin: unset;" strokeWidth="6" />
        </div>
        <div v-else-if="status === 'error' && error">
            <Message severity="error" class="mx-4">
                <span>{{ normalizeError(error) }}</span>
            </Message>
        </div>
        <div class="container flex flex-col gap-5 px-5" v-else>
            <div class="flex flex-col justify-start gap-3">
                <span class=" text-4xl">{{ data?.app.displayName }}</span>
                <div class="flex justify-start gap-2">
                    <Badge :value="data?.org.displayName" severity="info" />
                    <Badge :value="data?.artifactGroup?.displayName || undefined" severity="info" />
                </div>
                <PlatformBadge :osType="data?.app?.osType" />
            </div>
            <Panel v-for="item in artifacts" :key="item.id">
                <template #header>
                    <div class="flex flex-row w-full">
                        <div class="flex-1 flex flex-col gap-1">
                            <a :name="item.releaseId" :href="'#' + item.releaseId" class="font-semibold text-lg">Version
                                {{
                                    item.versionName2 }}
                                ({{
                                    item.releaseId
                                }})</a>
                            <ClientOnly>
                                <span class="self-start" v-tooltip="{ value: item.createdAt, showDelay: 1250 }">{{
                                    formatDate(item.createdAt) }}</span>
                            </ClientOnly>
                            <!-- <span>30mbbb</span> -->
                        </div>
                        <div>
                            <DownloadButton :releaseId="item.releaseId.toString()" />
                        </div>
                    </div>
                </template>
                <template #default>
                    <div v-if="item.releaseNotes">
                        <span class="whitespace-pre-wrap">{{ item.releaseNotes }}</span>
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
import { PlatformBadge } from '#components'
import { formatDate } from '#imports'
import { normalizeError } from '~/utils/showErrorAlert'

const showAccountBtn = useState<boolean>('show-account-btn')

definePageMeta({
    layout: 'install-layout',
    server: false,
    path: '/install/:orgName/apps/:appName/:publicId',
})

const route = useRoute()
const { value: { publicId, orgName, appName } } = computed(() => route.params)
const { value: { artifactId, releaseId } } = computed(() => route.query)

const { data, status, error } = useFetch('/api/install/get-data', {
    query: {
        publicId,
        orgName,
        appName,
        artifactId,
        releaseId,
    },
    server: false,
})
watchEffect(() => {
    if (data.value) {
        showAccountBtn.value = data.value.artifactGroup.isPublic !== true
    }
})
watch(() => error.value, (err) => {
    if (err && err.statusCode === 400) {
        showAccountBtn.value = true
    }
}, {
    immediate: true,
})
const artifacts = computed(() => data.value?.artifacts.map(e => e.artifacts!))

const title = useTitleApp(computed(() => `Install ${data.value?.app.displayName ?? ''}`))

const cookie = useCookie(cookieAuthKey)
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