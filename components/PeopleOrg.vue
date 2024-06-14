<template>
    <div class="card p-0">
        <DataTable scrollable :value="data" single selectionMode="single">
            <Column field="profileName" header="Name" style="width: 15%"></Column>
        </DataTable>
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const orgName = route.params.orgName

const { data } = useFetch('/api/list-org-people', {
    query: {
        orgName,
    },
})
</script>
