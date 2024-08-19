<template>
    <div class="sm:hidden">
        <Button icon="pi pi-bars" class="self-center" @click="isOpen = true" />
    </div>
</template>

<script setup lang="ts">
const { isOpen } = useAppDrawer()
</script>