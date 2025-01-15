<template>
    <AppBarContainer>
        <span class="text-2xl font-bold">{{ title }} Settings</span>
    </AppBarContainer>

    <div class="px-4 py-2">
        <AppTabMenu :items="items" />
        <div class="flex-1 mt-3">
            <NuxtPage />
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    name: 'orgs-orgName-settings',
})

const route = useRoute()
const items = ref<MenuItem[]>([
    {
        label: 'Info',
        icon: 'pi pi-info-circle',
        routeName: 'org-settings-info',
        command: navigateFromTab,
    },
    {
        label: 'People',
        icon: 'pi pi-user',
        routeName: 'orgs-orgName-settings-people',
        command: navigateFromTab,
    },
    {
        label: 'Danger',
        icon: 'pi pi-exclamation-triangle',
        routeName: 'orgs-orgName-settings-danger',
        command: navigateFromTab,
    },
])

if (route.name === 'orgs-orgName-settings') {
    navigateTo({
        name: items.value[0].routeName,
        replace: true,
    })
}

const detailOrg = useDetailGroup()
const title = useTitleApp(computed(() => detailOrg.value?.displayName))
</script>
