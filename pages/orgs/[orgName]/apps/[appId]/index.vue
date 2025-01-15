<template>
    <AppBarContainer>
        <div class="flex flex-row items-center">
            <div class="flex flex-row flex-1 gap-2 items-center">
                <AppTitle :title="title" />
                <div v-if="status === 'pending'">
                    <ProgressSpinner style="width: 22px; height: 22px" strokeWidth="6" />
                </div>
            </div>
            <NuxtLink :to="{
                name: 'orgs-orgName-apps-appId-settings',
                params: params,
            }">
                <Button icon="pi pi-cog" outlined data-testid="settings_app_btn" />
            </NuxtLink>
        </div>
    </AppBarContainer>
    <div class="flex-1 flex flex-col gap-3">
        <AppTabMenu v-model:tab-index="activeTabIndex" :items="items" class="px-4 pt-2" />
        <div class="px-4 py-2">
            <NuxtPage :osType="detailApp.data?.value?.osType" />
        </div>
    </div>
</template>

<script setup lang="ts">
const { params, name } = useRoute()
const route = useRoute()

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

const activeTabIndex = ref<number>()
const appName = params.appId as string
const orgName = params.orgName as string

watchEffect(() => {
    if (route.name === 'orgs-orgName-apps-appId') {
        activeTabIndex.value = 0
        navigateTo({
            name: items.value[activeTabIndex.value!].routeName,
            replace: true,
        })
    }
})

const detailApp = useFetch('/api/detail-app', {
    query: {
        appName: appName,
        orgName: orgName,
    },
})
const { status } = detailApp

const title = computed(() => detailApp.data.value?.displayName)
useTitleApp(title)
</script>

<style></style>