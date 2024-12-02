<template>
    <Button class="mr-3" :icon="appTheme === 'appdark' ? 'pi pi-moon' : 'pi pi-sun'" outlined @click="switchTheme"
        text />
</template>

<script setup lang="ts">
const { switchTheme, appTheme } = useAppTheme()
</script>
