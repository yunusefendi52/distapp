<template>
    <AppBarContainer>
        <div class="flex flex-row flex-1 gap-2 items-center">
            <AppTitle :title="title" />
            <div v-if="status === 'pending'">
                <ProgressSpinner style="width: 22px; height: 22px" strokeWidth="6" />
            </div>
        </div>
    </AppBarContainer>
    <div class="flex flex-col gap-3 px-4 py-2">
        <AppTabMenu v-model:tab-index="tabIndex" :items="items" />
        <NuxtPage />
    </div>
</template>

<script setup lang="ts">
const route = useRoute()

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
    {
        label: 'Danger',
        icon: 'pi pi-exclamation-triangle',
        routeName: 'settings-danger-app',
        command: navigateFromTab,
    },
])

const tabIndex = ref<number>(0)
if (import.meta.client) {
    watchEffect(() => {
        if (!tabIndex.value) {
            tabIndex.value = 0
            navigateTo({
                name: items.value[tabIndex.value].routeName,
                replace: true,
            })
        }
    })
}

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

const title = useTitleApp('Apps Settings')
</script>

<style></style>