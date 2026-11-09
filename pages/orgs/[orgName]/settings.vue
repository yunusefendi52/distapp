<template>
    <AppBarContainer>
        <div class="flex flex-row items-center gap-2">
            <NuxtLink :to="{ name: 'orgs', params: { orgName } }">
                <Button icon="pi pi-arrow-left" text rounded aria-label="Back to organization"
                    v-tooltip.top="'Back to organization'" data-testid="back_to_org_btn" />
            </NuxtLink>
            <span class="text-2xl font-bold">{{ title }} Settings</span>
        </div>
    </AppBarContainer>

    <div class="flex flex-col gap-3 px-4 py-2">
        <AppTabMenu :items="items" />
        <div class="flex-1">
            <NuxtPage />
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    name: 'orgs-orgName-settings',
})

const route = useRoute()
const orgName = route.params.orgName as string
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
        label: 'Retention',
        icon: 'pi pi-history',
        routeName: 'orgs-orgName-settings-retention',
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
