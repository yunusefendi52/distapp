<template>
    Redirecting
</template>

<script setup lang="ts">
const { params } = useRoute()

navigateTo({
    name: 'install-publicId',
    params: {
        publicId: params.publicId,
    },
    redirectCode: 302,
})
</script>