<template>
    <Button class="mr-3" :icon="appTheme === 'appdark' ? 'pi pi-sun' : 'pi pi-moon'" outlined @click="switchTheme" text />
</template>

<script setup lang="ts">
const { switchTheme, appTheme } = useAppTheme()
</script>
