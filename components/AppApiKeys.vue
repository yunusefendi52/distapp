<template>
    <ConfirmDialog />
    <Menu ref="rowMenu" :model="menuItems" popup />

    <div class="flex flex-col items-start gap-4 w-full">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Button :loading="isPending" label="Create API key" data-testid="generate_api_key" @click="generate" />
            <NuxtLink class="inline-flex items-center gap-1 text-sm underline" href="https://docs.distapp.app/cli/cli-usage"
                target="_blank">
                Learn how the CLI uses API keys
                <i class="pi pi-external-link text-xs" aria-hidden="true" />
            </NuxtLink>
        </div>

        <div v-if="generatedKey"
            class="flex w-full flex-col gap-3 rounded-lg border border-[var(--p-content-border-color)] bg-[var(--p-surface-50)] p-4 dark:bg-[var(--p-surface-900)]">
            <div class="flex items-start justify-between gap-3">
                <div class="flex flex-col gap-1">
                    <span class="flex items-center gap-2 font-semibold">
                        <i class="pi pi-check-circle" aria-hidden="true" />
                        New API key created
                    </span>
                    <span class="text-sm text-[var(--p-text-muted-color)]">
                        Copy it now — you won't see it again.
                    </span>
                </div>
                <Button icon="pi pi-times" text rounded size="small" aria-label="Dismiss new API key"
                    @click="dismissGeneratedKey" />
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <code data-testid="tkn_spn"
                    class="min-w-0 flex-1 break-all rounded-md border border-[var(--p-content-border-color)] bg-[var(--p-surface-100)] px-3 py-2 font-mono text-sm dark:bg-[var(--p-surface-950)]">
                    {{ tokenVisible ? generatedKey : maskedToken }}
                </code>
                <Button :label="tokenVisible ? 'Hide' : 'Show'" text size="small"
                    @click="tokenVisible = !tokenVisible" />
                <AppCopyButton text label="Copy" :textValue="() => generatedKey" />
            </div>
        </div>

        <div v-if="status === 'pending' && !apiKeys?.apiKeys?.length" class="flex w-full justify-center py-10">
            <ProgressSpinner style="width: 24px; height: 24px" strokeWidth="6" />
        </div>

        <DataTable v-else :value="apiKeys?.apiKeys ?? []" :show-gridlines="false" scrollable dataKey="apiKeys.id"
            class="self-stretch">
            <Column header="Created">
                <template #body="{ data }">
                    <ClientOnly>
                        <span v-tooltip="{ value: formatSimpleDate(data.apiKeys.createdAt), showDelay: 1250 }">
                            {{ formatDate(data.apiKeys.createdAt) }}
                        </span>
                    </ClientOnly>
                </template>
            </Column>
            <Column header="Actions" headerClass="text-right" style="width: 6rem">
                <template #body="{ data }">
                    <div class="flex justify-end">
                        <Button icon="pi pi-ellipsis-v" text rounded size="small" aria-label="Key actions"
                            @click.stop="openRowMenu($event, data)" />
                    </div>
                </template>
            </Column>
            <template #empty>
                <div class="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <i class="pi pi-key text-3xl text-[var(--p-text-muted-color)]" />
                    <div class="flex flex-col gap-1">
                        <span class="font-semibold">No API keys yet</span>
                        <span class="text-sm text-[var(--p-text-muted-color)]">
                            Create a key to authenticate the CLI.
                        </span>
                    </div>
                    <Button label="Create API key" :loading="isPending" @click="generate" />
                </div>
            </template>
        </DataTable>
    </div>
</template>

<script setup lang="ts">
import { formatDate, formatSimpleDate, MenuItem } from '#imports'

const { params } = useRoute()

const appName = params.appId as string
const orgName = params.orgName as string
const toast = useToast()

const { data: apiKeys, execute, status } = useFetch('/api/api-keys/list-api-keys', {
    query: {
        appName,
        orgName,
    }
})

const generatedKey = ref<string | null>(null)
const tokenVisible = ref(false)
const maskedToken = computed(() => generatedKey.value
    ? '•'.repeat(Math.min(generatedKey.value.length, 48))
    : '')

const dismissGeneratedKey = () => {
    generatedKey.value = null
    tokenVisible.value = false
}

const { mutate: generate, isPending } = useMutation({
    mutationFn: () => $fetch('/api/api-keys/generate-api-key', {
        method: 'post',
        body: {
            orgName,
            appName,
        },
    }) as Promise<{ token: string }>,
    onSuccess: (result) => {
        generatedKey.value = result?.token ?? null
        tokenVisible.value = false
        execute()
    },
    onError: (error: any) => {
        toast.add({
            severity: 'error',
            detail: error.message,
            life: 5000,
        })
    },
})

const { mutate: deleteApiKeyApi } = useMutation({
    mutationFn: (apiKeyId: string) => $fetch('/api/api-keys/delete-api-key', {
        method: 'post',
        query: {
            orgName,
            appName,
            apiKeyId,
        },
    }),
    onSuccess: () => {
        execute()
        toast.add({
            severity: 'success',
            detail: 'API key deleted',
            life: 3000,
        })
    },
    onError: (error: any) => {
        toast.add({
            severity: 'error',
            detail: error.message,
            life: 5000,
        })
    },
})

const confirm = useConfirm()
const confirmDelete = (row: any) => {
    if (!row) return
    confirm.require({
        header: 'Delete API key',
        message: 'Any CLI or CI pipeline using this key will stop working.',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        acceptClass: 'p-button-danger',
        accept: () => deleteApiKeyApi(row.apiKeys.id),
    })
}

const rowMenu = ref()
const menuRow = ref<any>(null)
const menuItems = computed<MenuItem[]>(() => [
    {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => confirmDelete(menuRow.value),
    },
])

const openRowMenu = (event: Event, row: any) => {
    menuRow.value = row
    rowMenu.value?.toggle(event)
}
</script>
