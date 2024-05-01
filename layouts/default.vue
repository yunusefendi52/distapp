<script setup lang="ts">
import AppHeader from './AppHeader.vue';
import AppMenu from './AppMenu.vue';

const cookie = useCookie('app-auth')

const signout = () => {
    cookie.value = null
    navigateTo('/')
}

const visible = ref(false)

const route = useRoute()
watchEffect(() => {
    const path = route.path
    if (path) {
        visible.value = false
    }
})
</script>

<style scoped lang="scss">
.layout-container {
    >.layout-drawer {
        margin-bottom: 0px;
        margin: 0px !important;
        border-radius: 0px !important;
        border: 0px !important;
        border-right: 1px solid var(--surface-border) !important;

        width: 0rem;
        padding: 0rem;

        @media (min-width: 576px) {
            padding: 0.3rem;
            width: 300px;
        }
    }

    >.layout-content {
        padding: 1.25rem;
    }
}

@media (min-width: 576px) {
    .header-mobile {
        display: none !important;
    }
}
</style>

<template>
    <div class="h-full flex flex-column">
        <!-- <div style="border-bottom: 1px solid var(--surface-border);">
            <AppHeader />
        </div> -->
        <div class="flex-1 flex flex-row overflow-auto layout-container">
            <div class="card flex flex-column layout-drawer">
                <Sidebar v-model:visible="visible">
                    <div class="flex flex-col h-full">
                        <AppMenu class="flex-1" />
                        <div class="flex gap-3 p-2 flex-column">
                            <Button @click="signout" label="Sign Out"></Button>
                        </div>
                    </div>
                </Sidebar>
                <div class="flex-1 overflow-auto">
                    <AppHeader />
                    <AppMenu />
                </div>
                <div class="flex gap-3 p-2 flex-column">
                    <Button @click="signout" label="Sign Out"></Button>
                </div>
            </div>
            <div class="flex-1 overflow-auto layout-content">
                <div class="mb-3 flex flex-row gap-3 items-center header-mobile">
                    <Button icon="pi pi-bars" @click="visible = !visible" />
                    <label class="font-bold text-lg">DistApp</label>
                </div>
                <slot />
            </div>
        </div>
    </div>
</template>
