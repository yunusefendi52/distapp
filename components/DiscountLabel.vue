<script setup lang="ts">
const { data } = useFetch('/api/billing2/get-discount')
</script>

<template>
    <div v-if="data" class="mb-2">
        <Message severity="success" icon="pi pi-gift">
            <span>{{ data.basisPoints / 100 }}% discount first month</span>
        </Message>
    </div>
</template>