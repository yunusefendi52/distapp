<template>
    <div class="flex flex-col h-full">
        <div class="flex flex-row items-center justify-center h-12">
            <div class="flex flex-row flex-1 gap-2 items-center">
                <h4>Settings</h4>
                <!-- <div>
                <ProgressSpinner style="width: 22px; height: 22px" strokeWidth="6" />
            </div> -->
            </div>
        </div>
        <TabMenu v-model:active-index="tabIndex" :model="items" :pt="{
            menu: 'remove-bg-tabmenu',
            menuitem: 'remove-bg-tabmenu',
        }" />
        <div class="flex-1 mt-4">
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
