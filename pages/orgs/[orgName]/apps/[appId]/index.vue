<template>
    <div class="flex flex-row items-center justify-center h-12">
        <div class="flex flex-row flex-1 gap-2 items-center">
            <h4>{{ detailApp.data.value?.displayName }}</h4>
            <div v-if="status === 'pending'">
                <ProgressSpinner style="width: 22px; height: 22px" strokeWidth="6" />
            </div>
        </div>
        <NuxtLink :to="`../settings`">
            <Button icon="pi pi-cog" severity="secondary" />
        </NuxtLink>
    </div>
    <div class="flex flex-col gap-3">
        <TabMenu v-model:active-index="active" :model="items" :pt="{
            menu: 'remove-bg-tabmenu',
            menuitem: 'remove-bg-tabmenu',
}">
            <template #item="{ item, props }">
                <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" replace custom>
                    <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                        <span v-bind="props.icon" />
                        <span v-bind="props.label">{{ item.label }}</span>
                    </a>
                </router-link>
                <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
                    <span v-bind="props.icon" />
                    <span v-bind="props.label">{{ item.label }}</span>
                </a>
            </template>
        </TabMenu>
        <div>
            <Releases :org-name="orgName" :app-name="appName" v-if="active === 0" />
            <Groups :org-name="orgName" :app-name="appName" v-else-if="active === 1" />
        </div>
    </div>
</template>

<script setup lang="ts">
const items = ref([
    {
        label: 'Artifacts',
        route: '../releases/',
    },
    {
        label: 'Groups',
        route: '../groups/',
    },
])

const { params } = useRoute()
const router = useRouter()
const tabName = params.tabName as string

const tabs = [
    'releases',
    'groups'
]
const tabIndex = tabs.findIndex(e => e === tabName as string)
if (tabIndex === -1) {
    await navigateTo(`./${tabs[0]}`)
}
const active = ref(tabIndex !== -1 ? tabIndex : 0);
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