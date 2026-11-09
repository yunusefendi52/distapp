<template>
    <ConfirmDialog />
    <div class="max-w-2xl rounded-lg border border-red-200 dark:border-red-900/70">
        <div class="flex items-start gap-3 border-b border-red-200 px-4 py-3 dark:border-red-900/70">
            <i class="pi pi-exclamation-triangle mt-0.5 text-red-500 dark:text-red-400" aria-hidden="true" />
            <div class="flex flex-col gap-1">
                <span class="font-semibold text-red-600 dark:text-red-400">Danger zone</span>
                <span class="text-sm text-[var(--p-text-muted-color)]">
                    Deleting this organization is permanent. It removes all apps, releases, groups, testers, API keys,
                    and members, and breaks all install links.
                </span>
            </div>
        </div>
        <form class="flex flex-col gap-3 p-4" @submit.prevent="onDelete">
            <label for="confirmOrgName" class="text-sm">
                Type <code data-testid="org_name_span" class="font-mono font-semibold">{{ orgName }}</code> to confirm
            </label>
            <InputText id="confirmOrgName" data-testid="orgName" v-model="confirmName" placeholder="Type the org id"
                autocomplete="off" :disabled="isPending" />
            <div class="flex flex-wrap justify-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" outlined :disabled="isPending"
                    @click="cancel" />
                <Button type="submit" label="Delete organization" severity="danger" data-testid="deleteOrgBtn"
                    :disabled="!isConfirmed" :loading="isPending" />
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
const { params } = useRoute()
const orgName = String(params.orgName)

const confirmName = ref('')
const isConfirmed = computed(() => confirmName.value.trim() === orgName)
const toast = useToast()
const confirm = useConfirm()

const { mutate: deleteOrg, isPending } = useMutation({
    mutationFn: () => $fetch('/api/orgs/delete-org', {
        method: 'post',
        body: {
            orgName,
        },
    }),
    onSuccess: async () => {
        toast.add({
            severity: 'success',
            detail: 'Organization deleted',
            life: 3000,
        })
        await navigateTo({
            name: 'apps',
            replace: true,
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
        header: 'Delete organization',
        message: `Permanently delete "${orgName}" and everything in it? This cannot be undone.`,
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete organization',
        acceptClass: 'p-button-danger',
        accept: () => deleteOrg(),
    })
}

const cancel = () => {
    navigateTo({
        name: 'org-settings-info',
        params: { orgName },
    })
}
</script>
