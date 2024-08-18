<template>
    <AppBarContainer>
        <div class="flex flex-row flex-1 gap-2 items-center">
            <span class="text-2xl font-bold">Apps Settings</span>
            <div v-if="status === 'pending'">
                <ProgressSpinner style="width: 22px; height: 22px" strokeWidth="6" />
            </div>
        </div>
    </AppBarContainer>
    <div class="flex flex-col gap-3 px-4 py-2">
        <TabMenu v-model:active-index="active" :model="items" :pt="{
            menu: 'remove-bg-tabmenu',
            menuitem: 'remove-bg-tabmenu',
        }" />
        <NuxtPage />
    </div>
</template>

<script setup lang="ts">
const items = ref<MenuItem[]>([
    {
        label: 'App Info',
        routeName: 'app-info-settings',
        command: navigateFromTab,
    },
    {
        label: 'API Keys',
        routeName: 'app-info-api-keys',
        command: navigateFromTab,
    },
])

const active = ref(0)

const { params } = useRoute()

const appName = params.appId as string
const orgName = params.orgName as string

const detailApp = useFetch('/api/detail-app', {
    query: {
        appName: appName,
        orgName: orgName,
    },
})
const { status } = detailApp
</script>

<style></style>