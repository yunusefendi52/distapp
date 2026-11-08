<script setup lang="ts">
const { isOpen } = useAppDrawer()
</script>

<style lang="scss">
.p-drawer-nb {
    border: unset !important;
    // border-right: 1px var(--p-content-border-color) solid !important;
}

// .layout-content {
//     background: rgb(255, 255, 255);
// }

.appdark .layout-content {
    background: rgb(14, 14, 14);
}
</style>

<template>
    <div class="h-full flex flex-row overflow-auto">
        <Drawer id="app-drawer" class="p-drawer-nb" v-model:visible="isOpen" :block-scroll="true">
            <template #container="{ closeCallback }">
                <LazyAppDrawer class="bg-color" />
            </template>
        </Drawer>
        <LazyAppDrawer class="hidden md:inline-flex w-[280px] bg-color" />
        <AppDivider orientation="vertical" class="hidden md:inline-flex" />
        <div class="flex-1 overflow-auto layout-content">
            <slot />
        </div>
    </div>
</template>
