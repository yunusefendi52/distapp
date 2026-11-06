<script setup lang="ts">
const { isOpen } = useAppDrawer()
</script>

<template>
    <div class="md:hidden">
        <Button icon="pi pi-bars" text class="self-center" aria-label="Open menu" aria-haspopup="dialog"
            aria-controls="app-drawer" :aria-expanded="isOpen ? 'true' : 'false'" @click="isOpen = true" />
    </div>
</template>
