<template>
    {{ route.params }}
</template>

<script setup lang="ts">
const route = useRoute()
console.log(route.params)
</script>