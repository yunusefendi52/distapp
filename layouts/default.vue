<script setup lang="ts">
import AppHeader from './AppHeader.vue';
import AppMenu from './AppMenu.vue';

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

<style scoped lang="scss"></style>

<template>
    <div class="h-full flex flex-row overflow-auto">
        <div class="flex flex-col" style="width: 300px;">
            <div class="flex-1 overflow-auto">
                <AppHeader />
                <AppMenu />
            </div>
            <LazyBottomMenu />
        </div>
        <Divider layout="vertical" />
        <div class="flex-1 overflow-auto layout-content">
            <!-- <div class="mb-3 flex flex-row gap-3 items-center header-mobile">
                    <Button icon="pi pi-bars" @click="visible = !visible" />
                    <label class="font-bold text-lg">DistApp</label>
                </div> -->
            <slot />
        </div>
    </div>
    <LazyJoinInviteLink v-model="joinDialog" @joined="joined" />
</template>
