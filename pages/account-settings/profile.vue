<template>
    <div class="py-2">
        <div class="flex flex-col gap-2 mb-3">
            <label>Name</label>
            <InputText :value="data?.name" readonly fluid autocomplete="off" />
        </div>
        <div class="flex flex-col gap-2 mb-3">
            <label>Email</label>
            <InputText :value="data?.email" readonly fluid autocomplete="off" />
        </div>
    </div>
</template>

<script lang="ts" setup>
const { data } = await useFetch('/api/account-settings/profile/get-profile')
</script>