<template>
    <div class="flex flex-col items-center">
        <div v-if="status === 'idle' || (status === 'pending' && !data)">
            <ProgressSpinner style="width: 50px; height: 50px; margin: unset;" strokeWidth="6" />
        </div>
        <div v-else-if="status === 'error' && error && !data">
            <Message severity="error" class="mx-4">
                <span>{{ normalizeError(error) }}</span>
            </Message>
        </div>
        <div class="container flex flex-col gap-5 px-5" v-else>
            <div class="flex flex-col justify-start gap-3">
                <span class=" text-2xl">{{ data?.app.displayName }}</span>
                <div class="flex justify-start gap-2">
                    <Badge :value="data?.org.displayName" severity="info" />
                    <Badge :value="data?.artifactGroup?.displayName || undefined" severity="info" />
                </div>
                <PlatformBadge :osType="data?.app?.osType" />
            </div>
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="search" aria-label="Search releases" autocomplete="off"
                    placeholder="Search version name" class="w-full" />
            </IconField>
            <Panel v-for="(item, index) in artifacts" :key="item.id">
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
                                <span class="flex items-center gap-2" v-tooltip="{ value: item.createdAt, showDelay: 1250 }">
                                    {{ formatDate(item.createdAt) }}
                                    <Badge v-if="debouncedSearch.length === 0 && first === 0 && index === 0" value="Latest"
                                        severity="success" />
                                </span>
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
            <Message severity="info" v-if="debouncedSearch && artifacts.length === 0">
                <span>No releases match your search.</span>
            </Message>
            <Paginator v-model:first="first" v-model:rows="pageSize" :totalRecords="total"
                template="FirstPageLink PrevPageLink NextPageLink RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 20, 50]" @page="onPage" v-else />
            <div class="flex justify-center" v-if="status === 'pending'">
                <ProgressSpinner style="width: 22px; height: 22px; margin: unset;" strokeWidth="6" />
            </div>
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

const page = ref(1)
const pageSize = ref(20)
const first = ref(0)
const search = ref('')
const debouncedSearch = refDebounced(search, 350)

// Total is unknown at first (no count query); MAX_SAFE_INT keeps "Next" enabled.
// A short page (fewer rows than pageSize) means it's the last page, so we lock in
// the real total from it — that's how "Next" gets disabled correctly.
const UNKNOWN_TOTAL = Number.MAX_SAFE_INTEGER
const total = ref(UNKNOWN_TOTAL)
const onPage = () => {
    page.value = first.value / pageSize.value + 1
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const { data, status, error } = useFetch('/api/install/get-data', {
    query: {
        publicId,
        orgName,
        appName,
        artifactId,
        releaseId,
        page,
        pageSize,
        search: debouncedSearch,
    },
    server: false,
})

watchEffect(() => {
    if (data.value) {
        showAccountBtn.value = data.value.artifactGroup.isPublic !== true
    }
})
// Discover the real total on the first short page we ever see
watchEffect(() => {
    const rows = data.value?.artifacts?.length
    if (rows != null && rows < pageSize.value) {
        total.value = (page.value - 1) * pageSize.value + rows
    }
})
watch(pageSize, () => {
    total.value = UNKNOWN_TOTAL
})
watch(debouncedSearch, () => {
    page.value = 1
    first.value = 0
    total.value = UNKNOWN_TOTAL
})
watch(() => error.value, (err) => {
    if (err && err.statusCode === 400) {
        showAccountBtn.value = true
    }
}, {
    immediate: true,
})
const artifacts = computed(() => data.value?.artifacts.map(e => e.artifacts!) ?? [])

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