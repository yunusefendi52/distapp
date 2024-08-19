<script setup lang="ts">
const { isOpen } = useAppDrawer()
const visible = ref(false)

const route = useRoute()
watchEffect(() => {
    const path = route.path
    if (path) {
        visible.value = false
    }
})

const joinDialog = ref(false)
const joined = () => {
    location.reload()
}
</script>

<style lang="scss">
.p-drawer-nb {
    border: unset !important;
    // border-right: 1px var(--p-content-border-color) solid !important;
}
</style>

<template>
    <div class="h-full flex flex-row overflow-auto">
        <Drawer class="p-drawer-nb" v-model:visible="isOpen" :block-scroll="true">
            <template #container="{ closeCallback }">
                <LazyAppDrawer />
            </template>
        </Drawer>
        <LazyAppDrawer style="width: 300px;" class="hidden sm:inline-flex" />
        <AppDivider orientation="vertical" class="hidden sm:inline-flex" />
        <div class="flex-1 overflow-auto layout-content">
            <slot />
        </div>
    </div>
    <LazyJoinInviteLink v-model="joinDialog" @joined="joined" />
</template>
