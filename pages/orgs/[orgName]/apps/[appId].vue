<template>
    <h4>{{ detailApp.data.value?.displayName }}</h4>
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
        <!-- <TabView v-model:active-index="active">
            <TabPanel header="Artifacts">
                <Releases :org-name="orgName" :app-name="appName" />
            </TabPanel>
            <TabPanel header="Groups">
                <p class="m-0">
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
                    totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae
                    dicta sunt explicabo. Nemo enim
                    ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni
                    dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam
                    eius modi.
                </p>
            </TabPanel>
        </TabView> -->
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

const detailApp = await useFetch('/api/detail-app', {
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