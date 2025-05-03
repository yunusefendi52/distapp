<template>
    <div class="flex flex-col">
        <AppBarContainer>
            <div class="flex flex-col md:flex-row gap-2">
                <div class="flex flex-row items-center gap-2 flex-1">
                    <div class="flex-1 flex gap-2 items-center">
                        <AppTitle :title="title" />
                    </div>
                </div>
            </div>
        </AppBarContainer>
        <div class="px-4 py-2">
            <AppTabMenu :items="items" />
            <div class="flex-1 mt-3">
                <NuxtPage />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const title = useTitleApp('Account Settings')

const route = useRoute()

const items = ref<MenuItem[]>([
    {
        label: 'Profile',
        routeName: 'account-settings-profile',
        command: navigateFromTab,
    },
    {
        label: 'Billing',
        routeName: 'account-settings-billing',
        command: navigateFromTab,
    },
    {
        label: 'Usage',
        routeName: 'account-settings-usage',
        command: navigateFromTab,
    },
])
watchEffect(() => {
    if (route.name === 'account-settings') {
        navigateTo({
            name: items.value[0].routeName,
            replace: true,
        })
    }
})
</script>