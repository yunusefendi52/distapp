<template>
    <div class="flex flex-col items-start gap-3 w-full">
        <Button @click="() => mutate()" :loading="isPending" label="Generate Token" />
        <div>
            See this how to use <NuxtLink class="underline"
                href="https://github.com/yunusefendi52/distapp?tab=readme-ov-file#cli-usage">
                CLI
            </NuxtLink>
        </div>

        <AppCard class="p-4" v-show="data">
            <span class="text-sm" style="color: var(--p-text-muted-color);">Keep this key safe</span>
            <div class="flex flex-row gap-4 items-center">
                <span class="flex-1 break-all flex-wrap text-xl">{{ data?.token }}</span>
                <Button icon="pi pi-copy" @click="() => copyText(data?.token)" />
            </div>
        </AppCard>

        <DataTable :value="apiKeys?.apiKeys" class="self-stretch">
            <Column header="Created At">
                <template #body="{ data }">
                    <span>{{ moment(data.apiKeys.createdAt).format('LLL') }}</span>
                </template>
            </Column>
            <Column header="">
                <template #body="{ data }">
                    <Button @click="(e) => deleteApiKey(data, e)" icon="pi pi-trash" severity="danger"
                        aria-label="Delete" />
                </template>
            </Column>
            <template #empty>
                <div class="flex items-center justify-center">
                    <label>No API Keys</label>
                </div>
            </template>
        </DataTable>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
const { params } = useRoute()

const appName = params.appId as string
const orgName = params.orgName as string

const { data: apiKeys, execute } = useFetch('/api/api-keys/list-api-keys', {
    query: {
        appName,
        orgName,
    }
})

const { mutate, data, isPending } = useMutation({
    mutationFn: async (r) => {
        return await $fetch('/api/api-keys/generate-api-key', {
            method: 'post',
            body: {
                orgName,
                appName,
            },
            onResponse: (r) => {
                if (r.response.ok) {
                    execute()
                }
            }
        })
    },
})

const { mutate: deleteApiKeyApi } = useMutation({
    mutationFn: (r: any) => {
        return $fetch.raw('/api/api-keys/delete-api-key', {
            method: 'post',
            query: {
                orgName,
                appName,
                apiKeyId: r.apiKeyId,
            },
            onResponse: (r) => {
                if (r.response.ok) {
                    execute()
                }
            },
        })
    }
})

const confirm = useConfirm()
const deleteApiKey = (req: any, event: any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'Do you want to remove this api key?',
        icon: 'pi pi-info-circle',
        rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
        acceptClass: 'p-button-danger p-button-sm',
        rejectLabel: 'Cancel',
        acceptLabel: 'Remove',
        accept: () => {
            deleteApiKeyApi({
                apiKeyId: req.apiKeys.id,
            })
        },
        reject: () => {
        }
    });
}
</script>