<script setup lang="ts">
import AppHeader from './AppHeader.vue';
import AppMenu from './AppMenu.vue';

const cookie = useCookie('app-auth')

const signout = () => {
    cookie.value = null
    navigateTo('/')
}

</script>

<template>
    <div class="h-full flex flex-column">
        <!-- <div style="border-bottom: 1px solid var(--surface-border);">
            <AppHeader />
        </div> -->
        <div class="flex-1 flex flex-row overflow-auto">
            <div style="width: 300px; margin-bottom: 0px; margin: 0px !important; border-radius: 0px !important; border: 0px !important; border-right: 1px solid var(--surface-border) !important;"
                class="card ml-2 mt-2 mb-2 p-2 flex flex-column">
                <div class="flex-1 overflow-auto">
                    <AppHeader />
                    <AppMenu />
                </div>
                <div class="flex gap-3 p-2 flex-column">
                    <Button @click="signout" label="Sign Out"></Button>
                </div>
            </div>
            <div class="flex-1 overflow-auto p-5">
                <slot />
            </div>
        </div>
    </div>
</template>
