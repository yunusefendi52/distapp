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
        <TabMenu :activeIndex="activeTabIndex" :model="items" class="px-4 pt-2" />
        <div class="px-4 py-2">
            <NuxtPage :osType="detailApp.data?.value?.osType" />
        </div>
    </div>
</template>

<script setup lang="ts">
const { params, name } = useRoute()

const items = ref<MenuItem[]>([
    {
        label: 'Releases',
        routeName: 'orgs-orgName-apps-appId-index-releases',
        command: navigateFromTab,
    },
    {
        label: 'Groups',
        routeName: 'orgs-orgName-apps-appId-index-groups',
        command: navigateFromTab,
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