<template>
    <TabMenu v-model:active-index="tabIndex" :model="items" :pt="{
        menu: 'remove-bg-tabmenu',
        menuitem: 'remove-bg-tabmenu',
    }" />
</template>

<script setup lang="ts">
import { MenuItem } from '#imports'

const route = useRoute()
const tabIndex = defineModel<number>('tabIndex', {
    default: 0,
})
const items = defineModel<MenuItem[]>('items', {
    required: true,
})

watchEffect(() => {
    tabIndex.value = items.value.findIndex(e => e.routeName === route.name?.toString())
})
</script>
