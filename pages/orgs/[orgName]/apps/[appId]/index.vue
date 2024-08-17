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
            <Button icon="pi pi-cog" severity="secondary" />
        </NuxtLink>
    </AppBarContainer>
    <div class="flex flex-col gap-3 m-4">
        <SelectButton v-model="activeTab" :options="items" optionLabel="label" aria-labelledby="label">
            <template #option="slotProps">
                <NuxtLink :to="{
                    name: slotProps.option.routeName,
                    params: params,
                }">
                    <span>{{ slotProps.option.label }}</span>
                </NuxtLink>
            </template>
        </SelectButton>
        <div>
            <NuxtPage />
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

const osType = computed(() => toOsType(detailApp.data.value?.osType))
provide('detail-app', osType)
</script>

<style></style>