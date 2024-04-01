<template>
</template>

<script setup lang="ts">
definePageMeta({
    layout: false,
})

const cookie = useCookie('app-auth')
if (cookie.value) {
    await navigateTo('/apps')
} else {
    await navigateTo('/signin')
}
</script>