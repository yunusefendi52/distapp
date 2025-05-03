<template>
    <div v-if="!status || status === 'pending'">
        <ProgressSpinner style="width: 30px; height: 30px; margin: unset;" strokeWidth="6" class="self-center"
            data-testid="menu-loading" />
    </div>
    <div v-else class="mt-5">
        <AppCard>
            <div class="flex flex-col gap-1">
                <div class="flex flex-col">
                    <span class="font-medium">Total Storage</span>
                    <span class="font-light text-sm">Current total storage for all organizations you own</span>
                </div>
                <span class="text-2xl font-medium">{{ data ? formatBytes(data?.totalStorage) : '-' }}</span>
            </div>
        </AppCard>
        <DataTable :show-gridlines="false" :value="data?.usages || []" class="my-4">
            <Column field="orgDisplayName" header="Organization Name"></Column>
            <Column header="Size">
                <template #body="{ data }">
                    {{ data.storageSize ? formatBytes(data.storageSize) : '-' }}
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup lang="ts">
import { formatBytes } from '#imports'

const { data, status, refresh } = useFetch('/api/usage/get-usage')
</script>
