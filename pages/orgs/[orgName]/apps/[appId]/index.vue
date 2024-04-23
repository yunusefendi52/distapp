<template>
    <div class="flex flex-row items-center justify-center h-12">
        <div class="flex-1">
            <h4>{{ detailApp.data.value?.displayName }}</h4>
        </div>
        <!-- <Button icon="pi pi-trash" severity="danger" /> -->
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
provide('detail-app', toOsType(detailApp.data.value?.osType))
</script>

<style>
.remove-bg-tabmenu {
    background: unset;
}

.remove-bg-tabmenu>a {
    background: unset;
}
</style>