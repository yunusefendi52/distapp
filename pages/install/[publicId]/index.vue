<template>
    <div class="flex flex-col gap-6 px-4 sm:px-0">
        <div v-if="status === 'idle' || (status === 'pending' && !data)" class="flex flex-col gap-6">
            <section
                class="acc relative overflow-hidden rounded-xl border border-[var(--p-content-border-color)] bg-[var(--p-content-background)] shadow-sm">
                <div class="flex flex-col gap-5 p-5 sm:p-6">
                    <div class="flex items-start gap-4">
                        <div class="sk h-14 w-14 shrink-0 animate-pulse rounded-xl" />
                        <div class="flex min-w-0 flex-1 flex-col gap-2">
                            <div class="sk h-7 w-40 animate-pulse rounded-md" />
                            <div class="sk h-4 w-32 animate-pulse rounded" />
                            <div class="sk mt-1 h-6 w-24 animate-pulse rounded-full" />
                        </div>
                    </div>
                    <div class="sk h-24 animate-pulse rounded-lg" />
                </div>
            </section>
            <div class="sk h-10 animate-pulse rounded-md" />
            <div class="flex flex-col gap-3">
                <div class="sk h-4 w-28 animate-pulse rounded" />
                <div v-for="i in 3" :key="i"
                    class="rounded-lg border border-[var(--p-content-border-color)] bg-[var(--p-content-background)] p-4">
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex min-w-0 flex-1 flex-col gap-2">
                            <div class="sk h-5 w-24 animate-pulse rounded" />
                            <div class="sk h-4 w-44 animate-pulse rounded" />
                        </div>
                        <div class="sk h-9 w-24 shrink-0 animate-pulse rounded-md" />
                    </div>
                    <div class="sk mt-4 h-4 w-full animate-pulse rounded" />
                </div>
            </div>
        </div>
        <Message v-else-if="status === 'error' && error && !data" severity="error" class="mx-1">
            <span>{{ normalizeError(error) }}</span>
        </Message>
        <template v-else>
            <section
                class="acc relative overflow-hidden rounded-xl border border-[var(--p-content-border-color)] bg-[var(--p-content-background)] shadow-sm">
                <div class="relative flex flex-col gap-5 p-5 sm:p-6">
                    <div class="flex items-start gap-4">
                        <div
                            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[var(--acc-border)] bg-[var(--acc-soft)] text-2xl font-semibold text-[var(--acc)]">
                            {{ appInitial }}
                        </div>
                        <div class="flex min-w-0 flex-1 flex-col gap-1">
                            <div class="flex items-center gap-2">
                                <h1 class="truncate text-2xl font-semibold leading-tight tracking-tight">
                                    {{ data?.app.displayName }}
                                </h1>
                                <ProgressSpinner v-if="status === 'pending'"
                                    style="width: 20px; height: 20px; margin: unset;" strokeWidth="6" />
                            </div>
                            <div
                                class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-[var(--p-text-color)]">
                                <span class="truncate">{{ data?.org.displayName }}</span>
                                <template v-if="data?.artifactGroup?.displayName">
                                    <span aria-hidden="true">·</span>
                                    <span class="truncate">{{ data?.artifactGroup?.displayName }}</span>
                                </template>
                            </div>
                            <PlatformBadge class="mt-1" :osType="data?.app?.osType" />
                        </div>
                    </div>

                    <div v-if="latest"
                        class="flex flex-col gap-3 rounded-lg border border-[var(--acc-border)] bg-[var(--acc-soft)] p-4">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex min-w-0 flex-1 flex-col gap-1">
                                <span class="text-[11px] font-semibold uppercase tracking-wider text-[var(--acc)]">
                                    Latest release
                                </span>
                                <div class="flex flex-wrap items-baseline gap-x-2">
                                    <span class="truncate text-lg font-semibold">{{ latest.versionName2 }}</span>
                                    <span class="text-sm text-[var(--p-text-color)]">build
                                        {{ latest.versionCode2 }}</span>
                                </div>
                                <div
                                    class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-[var(--p-text-color)]">
                                    <ClientOnly>
                                        <span v-tooltip="{ value: latest.createdAt, showDelay: 1250 }">{{
                                            formatDate(latest.createdAt) }}</span>
                                    </ClientOnly>
                                    <template v-if="latest.fileContentLength">
                                        <span aria-hidden="true">·</span>
                                        <span>{{ formatBytes(latest.fileContentLength) }}</span>
                                    </template>
                                    <template v-if="latest.extension">
                                        <span aria-hidden="true">·</span>
                                        <span>{{ latest.extension }}</span>
                                    </template>
                                </div>
                            </div>
                            <DownloadButton :releaseId="latest.releaseId.toString()" class="shrink-0" />
                        </div>
                        <div v-if="latest.releaseNotes">
                            <p class="whitespace-pre-wrap text-sm leading-relaxed"
                                :class="latestNotesExpanded ? '' : 'line-clamp-3'">
                                {{ latest.releaseNotes }}
                            </p>
                            <button v-if="isNotesLong(latest.releaseNotes)" type="button"
                                class="mt-1 text-xs font-medium text-[var(--acc)] hover:underline"
                                @click="latestNotesExpanded = !latestNotesExpanded">
                                {{ latestNotesExpanded ? 'Show less' : 'Show more' }}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <IconField class="w-full">
                <InputIcon class="pi pi-search" />
                <InputText v-model="search" aria-label="Search releases" autocomplete="off" placeholder="Search releases"
                    class="w-full" />
            </IconField>

            <div v-if="visibleArtifacts.length > 0" class="flex flex-col gap-3">
                <span class="px-1 text-sm font-semibold text-[var(--p-text-color)]">Release history</span>
                <div v-for="item in visibleArtifacts" :key="item.id"
                    class="rounded-lg border border-[var(--p-content-border-color)] bg-[var(--p-content-background)] p-4 transition-colors hover:border-[var(--acc-border)]">
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex min-w-0 flex-1 flex-col gap-1">
                            <div class="flex flex-wrap items-baseline gap-x-2">
                                <span class="truncate text-base font-semibold">{{ item.versionName2 }}</span>
                                <span class="text-sm text-[var(--p-text-color)]">build
                                    {{ item.versionCode2 }}</span>
                            </div>
                            <div
                                class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-[var(--p-text-color)]">
                                <ClientOnly>
                                    <span v-tooltip="{ value: item.createdAt, showDelay: 1250 }">{{
                                        formatDate(item.createdAt) }}</span>
                                </ClientOnly>
                                <template v-if="item.fileContentLength">
                                    <span aria-hidden="true">·</span>
                                    <span>{{ formatBytes(item.fileContentLength) }}</span>
                                </template>
                                <template v-if="item.extension">
                                    <span aria-hidden="true">·</span>
                                    <span>{{ item.extension }}</span>
                                </template>
                            </div>
                        </div>
                        <DownloadButton :releaseId="item.releaseId.toString()" />
                    </div>
                    <div v-if="item.releaseNotes" class="mt-4">
                        <p class="whitespace-pre-wrap text-sm leading-relaxed text-[var(--p-text-color)]"
                            :class="expandedNotes[item.id] ? '' : 'line-clamp-3'">
                            {{ item.releaseNotes }}
                        </p>
                        <button v-if="isNotesLong(item.releaseNotes)" type="button"
                            class="mt-1 text-xs font-medium text-[var(--acc)] hover:underline"
                            @click="toggleNotes(item.id)">
                            {{ expandedNotes[item.id] ? 'Show less' : 'Show more' }}
                        </button>
                    </div>
                </div>
            </div>

            <Message v-if="artifacts.length === 0" severity="info">
                <span>{{ debouncedSearch ? 'No releases match your search.' : 'No releases available yet.' }}</span>
            </Message>

            <Paginator v-if="artifacts.length > 0" v-model:first="first" v-model:rows="pageSize" :totalRecords="total"
                template="FirstPageLink PrevPageLink NextPageLink RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 20, 50]" @page="onPage" />
        </template>
    </div>
</template>

<script setup lang="ts">
import { PlatformBadge } from '#components'
import { formatDate, formatBytes } from '#imports'
import { useRouteQuery } from '@vueuse/router'
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
const pageSize = useLocalStorage('install-page-size', 20)
const first = ref(0)
const searchQuery = useRouteQuery<string | null>('search', null, { mode: 'replace' })
const search = computed<string>({
    get: () => searchQuery.value ?? '',
    set: (value) => {
        searchQuery.value = value || null
    },
})
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
    if (status.value !== 'success') return
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

const appInitial = computed(() => data.value?.app.displayName?.trim().charAt(0).toUpperCase() ?? '')

// The newest release on the first, unfiltered page is promoted to the hero card.
const latest = computed(() => {
    if (debouncedSearch.value.length > 0 || first.value !== 0) return null
    return artifacts.value[0] ?? null
})
const visibleArtifacts = computed(() => latest.value ? artifacts.value.slice(1) : artifacts.value)

const latestNotesExpanded = ref(false)
watch(() => latest.value?.id, () => {
    latestNotesExpanded.value = false
})

const expandedNotes = ref<Record<string, boolean>>({})
const isNotesLong = (notes: string | null | undefined) => (notes?.length ?? 0) > 140
const toggleNotes = (id: string) => {
    expandedNotes.value[id] = !expandedNotes.value[id]
}

const title = useTitleApp(computed(() => `Install ${data.value?.app.displayName ?? ''}`))

const cookie = useCookie(cookieAuthKey)
</script>

<style scoped>
.sk {
    background-color: var(--p-surface-200);
}

.appdark .sk {
    background-color: var(--p-surface-700);
}

.acc {
    --acc: #15803d;
    --acc-soft: rgb(21 128 61 / 0.06);
    --acc-border: rgb(21 128 61 / 0.22);
}

.appdark .acc {
    --acc: #4ade80;
    --acc-soft: rgb(74 222 128 / 0.09);
    --acc-border: rgb(74 222 128 / 0.28);
}
</style>
