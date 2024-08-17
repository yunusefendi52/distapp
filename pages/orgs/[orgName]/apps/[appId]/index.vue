<template>
    <AppBarContainer>
        <div class="flex flex-row flex-1 gap-2 items-center">
            <span class="text-2xl font-bold">{{ detailApp.data.value?.displayName }}</span>
            <div v-if="status === 'pending'">
                <ProgressSpinner style="width: 22px; height: 22px" strokeWidth="6" />
            </div>
        </div>
        <NuxtLink :to="{
            name: 'orgs-orgName-apps-appId-settings',
            params: params,
        }">
            <Button icon="pi pi-cog" outlined />
        </NuxtLink>
    </AppBarContainer>
    <div class="flex-1 flex flex-col gap-3">
        <TabMenu :activeIndex="activeTabIndex" :model="items" class="px-4 pt-2">
            <template #item="{ item, props }">
                <NuxtLink v-if="item.routeName" v-slot="{ href, navigate }" :to="{
                    name: item.routeName,
                    params: {
                        orgName: orgName,
                        appId: appName,
                        ...item.routeParams,
                    },
                }" replace custom>
                    <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                        <span v-bind="props.icon" />
                        <span v-bind="props.label">{{ item.label }}</span>
                    </a>
                </NuxtLink>
                <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
                    <span v-bind="props.icon" />
                    <span v-bind="props.label">{{ item.label }}</span>
                </a>
            </template>
        </TabMenu>
        <div class="px-4 py-2">
            <NuxtPage :osType="detailApp.data?.value?.osType" />
        </div>
    </div>
</template>

<script setup lang="ts">
const { params, name } = useRoute()

const items = ref([
    {
        label: 'Releases',
        routeName: 'orgs-orgName-apps-appId-index-releases',
    },
    {
        label: 'Groups',
        routeName: 'orgs-orgName-apps-appId-index-groups',
    },
])

const activeTab = ref()
const activeTabIndex = computed(() => items.value.indexOf(activeTab.value))
const appName = params.appId as string
const orgName = params.orgName as string

if (import.meta.client) {
    watchEffect(() => {
        if (!activeTab.value) {
            activeTab.value = items.value.find(e => name === e.routeName) ?? items.value[0]
            navigateTo({
                name: activeTab.value.routeName,
            })
        }
    })
}

const detailApp = useFetch('/api/detail-app', {
    query: {
        appName: appName,
        orgName: orgName,
    },
})
const { status } = detailApp
</script>

<style></style>