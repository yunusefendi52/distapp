<template>
    <AppBarContainer>
        <span class="text-2xl font-bold">{{ detailOrg?.displayName }} Settings</span>
    </AppBarContainer>

    <div class="px-4 py-2">
        <TabMenu v-model:active-index="tabIndex" :model="items" :pt="{
            menu: 'remove-bg-tabmenu',
            menuitem: 'remove-bg-tabmenu',
        }" />
        <div class="flex-1 mt-3">
            <LazyInfoOrg v-if="tabIndex === 0" />
            <LazyPeopleOrg v-if="tabIndex === 1" />
        </div>
    </div>
</template>

<script setup lang="ts">
const detailOrg = useDetailGroup()

const tabIndex = ref(0)
const items = ref([
    {
        label: 'Info',
        icon: 'pi pi-info-circle',
    },
    {
        label: 'People',
        icon: 'pi pi-user',
    },
]);
</script>
