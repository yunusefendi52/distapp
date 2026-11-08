<script setup lang="ts">
import { CreateAppDialog, PlatformBadge } from '#components'
import { getIconForOsType } from '#imports'
import { ListAppsRequest } from '~/server/api/list-apps.get';
import { omitBy } from 'es-toolkit'
import { refDebounced } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'

const { name: routeName, params } = useRoute()
const orgNameParam = params.orgName
const isOrg = computed(() => routeName === 'orgs')

await useOrgsStore()

const openApp = (app: any) => {
    const appName = app.name
    const orgName = app.organization.name
    if (!orgName || !appName) {
        return
    }
    navigateTo({
        name: 'orgs-orgName-apps-appId-index-releases',
        params: {
            orgName: orgName,
            appId: appName,
        },
    })
};

const _searchRouteQuery = useRouteQuery<string | null>('search', null, { mode: 'replace' })
const searchQuery = computed<string>({
    get: () => _searchRouteQuery.value ?? '',
    set: (value) => {
        _searchRouteQuery.value = value || null
    },
})
const debouncedSearch = refDebounced(searchQuery, 350)

const request = ref<ListAppsRequest | undefined>({
    orgName: orgNameParam as string | undefined,
    search: searchQuery.value ?? undefined,
})
const { data: apps, refresh, status } = useFetch('/api/list-apps', {
    query: request,
    watch: [request],
})

watch(debouncedSearch, (value) => {
    request.value = omitBy({
        ...request.value,
        search: value ?? '',
    }, v => v ? false : true)
})

const dialog = useDialog()

const addApp = () => {
    dialog.open(CreateAppDialog, {
        props: {
            header: 'Add App',
            modal: true,
            style: {
                'width': '320px',
            },
        },
        data: {
            'orgName': orgNameParam,
        },
        onClose: (options) => {
            if (options?.data?.refresh) {
                refresh()
            }
        },
    })
}

useTitleApp('Apps')
</script>

<template>
    <div>
        <AppBarContainer>
            <div class="flex flex-col md:flex-row gap-2">
                <div class="flex flex-row items-center gap-2 flex-1">
                    <div class="flex-1 flex gap-2 items-center">
                        <AppTitle title="Apps" />
                        <ProgressSpinner style="width: 22px; height: 22px; margin: unset;" strokeWidth="6"
                            v-if="status === 'pending'" />
                    </div>
                    <div>
                        <NuxtLink :to="{
                            name: 'org-settings-info',
                            params: {
                                orgName: orgNameParam?.toString() ?? '',
                            },
                        }" v-if="isOrg">
                            <Button icon="pi pi-cog" outlined aria-label="Settings" data-testid="settings_btn" />
                        </NuxtLink>
                    </div>
                </div>
                <div class="flex flex-row gap-3 items-center">
                    <div class="flex-1 flex-shrink-0">
                        <IconField iconPosition="left">
                            <InputIcon class="pi pi-search"> </InputIcon>
                            <InputText style="width: 100%;" placeholder="Search" name="search" v-model="searchQuery" />
                        </IconField>
                    </div>
                    <div class="flex-shrink flex flex-row gap-2">
                        <div class="hidden md:block">
                            <Button label="Add App" @click="addApp"></Button>
                        </div>
                        <div class="md:hidden">
                            <Button icon="pi pi-plus" aria-label="Add App" @click="addApp"></Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppBarContainer>
        <div class="m-4">
            <div v-if="apps?.length" class="overflow-hidden rounded-md border border-[var(--p-content-border-color)]">
                <button v-for="app in apps ?? []" :key="app.name" type="button"
                    class="flex w-full cursor-pointer items-center gap-3 border-b border-[var(--p-content-border-color)] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[var(--p-surface-100)] dark:hover:bg-[var(--p-surface-800)]"
                    @click="openApp(app)">
                    <div
                        class="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md bg-[var(--p-surface-200)] font-semibold text-[var(--p-text-color)] dark:bg-[var(--p-surface-700)]">
                        <i :class="getIconForOsType(app.osType)" class="text-lg" />
                    </div>
                    <div class="flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-center md:gap-4">
                        <span class="truncate md:flex-1">{{ app.displayName }}</span>
                        <div class="flex min-w-0 items-center gap-2">
                            <PlatformBadge :osType="app.osType" />
                            <span v-if="!isOrg" class="truncate text-sm">{{ app.organization.displayName }}</span>
                        </div>
                    </div>
                    <i class="pi pi-chevron-right shrink-0 text-xs"></i>
                </button>
            </div>
            <div v-else-if="status !== 'pending'" class="flex items-center justify-center py-10 flex-col gap-2">
                <label>No apps yet. Add app by clicking button below</label>
                <Button label="Add App" @click="addApp" severity="secondary"></Button>
            </div>
        </div>
    </div>
</template>
