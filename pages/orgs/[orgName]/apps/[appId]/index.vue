<template>
    <div class="flex flex-row items-center justify-center h-12">
        <div class="flex flex-row flex-1 gap-2 items-center">
            <h4>{{ detailApp.data.value?.displayName }}</h4>
            <div v-if="status === 'pending'">
                <ProgressSpinner style="width: 22px; height: 22px" strokeWidth="6" />
            </div>
        </div>
        <NuxtLink :to="`${appName}/settings`">
            <Button icon="pi pi-cog" severity="secondary" />
        </NuxtLink>
    </div>
    <div class="flex flex-col gap-3">
        <TabMenu v-model:active-index="active" :model="items" :pt="{
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
        </div>
    </div>
</template>

<script setup lang="ts">
const items = ref([
    { label: 'Artifacts' },
    { label: 'Groups' },
])

const { currentRoute, push } = useRouter();
const { query, params } = useRoute()
const tabs = [
    'releases',
    'groups'
]
const tabIndex = tabs.findIndex(e => e == query.tab as string)
const active = ref(tabIndex !== -1 ? tabIndex : 0);

watchEffect(() => {
    const newTab = tabs[active.value]
    push({
        query: {
            ...currentRoute.value.query,
            tab: newTab,
        },
        replace: true,
    })
})
onBeforeUnmount(() => {
    push({
        query: {
            ...currentRoute.value.query,
            tab: undefined,
        },
        replace: true,
    })
})

const appName = params.appId as string
const orgName = params.orgName as string

const detailApp = useFetch('/api/detail-app', {
    query: {
        appName: appName,
        orgName: orgName,
    },
})
const { status } = detailApp

const osType = computed(() => toOsType(detailApp.data.value?.osType))
provide('detail-app', osType)
</script>

<style></style>