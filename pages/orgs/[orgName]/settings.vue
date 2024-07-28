<template>
    <AppBarContainer>
        <span class="text-2xl font-bold">Settings</span>
    </AppBarContainer>

    <div class="p-4">
        <TabMenu v-model:active-index="tabIndex" :model="items" :pt="{
            menu: 'remove-bg-tabmenu',
            menuitem: 'remove-bg-tabmenu',
        }" />
        <div class="flex-1 mt-3">
            <PeopleOrg v-if="tabIndex === 0" />
        </div>
    </div>
</template>

<script setup lang="ts">
const tabIndex = ref(0)
const items = ref([
    { label: 'People', icon: 'pi pi-user' },
]);
</script>
