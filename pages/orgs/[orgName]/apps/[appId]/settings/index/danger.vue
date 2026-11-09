<template>
    <ConfirmDialog />
    <div class="max-w-2xl rounded-lg border border-red-200 dark:border-red-900/70">
        <div class="flex items-start gap-3 border-b border-red-200 px-4 py-3 dark:border-red-900/70">
            <i class="pi pi-exclamation-triangle mt-0.5 text-red-500 dark:text-red-400" aria-hidden="true" />
            <div class="flex flex-col gap-1">
                <span class="font-semibold text-red-600 dark:text-red-400">Danger zone</span>
                <span class="text-sm text-[var(--p-text-muted-color)]">
                    Deleting this app is permanent. It removes releases, groups, testers, API keys, and breaks all
                    install links.
                </span>
            </div>
        </div>
        <form class="flex flex-col gap-3 p-4" @submit.prevent="onDelete">
            <label for="confirmAppName" class="text-sm">
                Type <code class="font-mono font-semibold">{{ appId }}</code> to confirm
            </label>
            <InputText id="confirmAppName" v-model="confirmName" placeholder="Type the app id" autocomplete="off"
                :disabled="isPending" />
            <div class="flex flex-wrap justify-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" outlined :disabled="isPending"
                    @click="cancel" />
                <Button type="submit" label="Delete app" severity="danger" :disabled="!isConfirmed"
                    :loading="isPending" />
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    name: 'settings-danger-app',
})

const { params } = useRoute()
const orgName = String(params.orgName)
const appId = String(params.appId)

const confirmName = ref('')
const isConfirmed = computed(() => confirmName.value.trim() === appId)
const toast = useToast()
const confirm = useConfirm()

const { mutate: deleteApp, isPending } = useMutation({
    mutationFn: () => $fetch('/api/apps/delete-app', {
        method: 'post',
        body: {
            orgName,
            appName: appId,
        },
    }),
    onSuccess: async () => {
        toast.add({
            severity: 'success',
            detail: 'App deleted',
            life: 3000,
        })
        await navigateTo({
            name: 'orgs',
            params: { orgName },
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

const onDelete = () => {
    if (!isConfirmed.value) return
    confirm.require({
        header: 'Delete app',
        message: `Permanently delete "${appId}" and all its releases, groups, testers, and API keys?`,
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete app',
        acceptClass: 'p-button-danger',
        accept: () => deleteApp(),
    })
}

const cancel = () => {
    navigateTo({
        name: 'app-info-settings',
        params: { orgName, appId },
    })
}
</script>
