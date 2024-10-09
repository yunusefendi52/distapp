<template>
    <span class="text-lg">Do you really mean to delete this org? Type below "{{ orgName }}"</span>
    <form class="mt-5" action="/api/orgs/delete-org" method="get">
        <div class="flex flex-col gap-3 justify-start items-start">
            <InputText name="orgName" placeholder='Here type your org id' required />
            <Button type="submit" label="Delete" severity="danger" />
        </div>
    </form>
</template>

<script setup lang="ts">
const { params: { orgName } } = useRoute()
</script>
