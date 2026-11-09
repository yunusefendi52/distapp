<template>
    <div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <IconField class="w-full sm:max-w-[240px]">
            <InputIcon class="pi pi-search" />
            <InputText v-model="search" placeholder="Search groups" class="w-full" aria-label="Search groups" />
        </IconField>
        <div class="flex flex-1 items-center gap-2">
            <Select v-model="visibility" :options="visibilityOptions" optionLabel="label" optionValue="value"
                class="flex-1 sm:w-[140px] sm:flex-none" aria-label="Filter by visibility" />
            <Button label="New Group" class="ml-auto shrink-0" data-testid="new_group_btn" @click="visible = true" />
        </div>
    </div>

    <DataTable :show-gridlines="false" scrollable :value="filteredList" dataKey="id" @row-click="selectRow">
        <Column header="Group">
            <template #body="{ data }">
                <div class="flex flex-col">
                    <span class="font-semibold">{{ data.displayName || data.name }}</span>
                    <span class="text-xs text-[var(--p-text-muted-color)] sm:hidden">
                        {{ formatDate(data.createdAt) }}
                    </span>
                </div>
            </template>
        </Column>
        <Column header="Visibility" class="whitespace-nowrap">
            <template #body="{ data }">
                <span
                    class="inline-flex items-center gap-1 rounded-full bg-[var(--p-surface-200)] px-2 py-0.5 text-xs whitespace-nowrap dark:bg-[var(--p-surface-700)]">
                    <i :class="data.isPublic ? 'pi pi-globe' : 'pi pi-lock'" class="text-[0.65rem]"
                        aria-hidden="true" />
                    {{ data.isPublic ? 'Public' : 'Private' }}
                </span>
            </template>
        </Column>
        <Column header="Created" class="hidden whitespace-nowrap sm:table-cell">
            <template #body="{ data }">
                <ClientOnly>
                    <span v-tooltip="{ value: data.createdAt, showDelay: 1250 }">{{ formatDate(data.createdAt) }}</span>
                </ClientOnly>
            </template>
        </Column>
        <Column header="" style="width: 5.5rem">
            <template #body="{ data }">
                <div class="flex items-center justify-end gap-1">
                    <span @click.stop>
                        <AppCopyButton text :textValue="() => installLink(data)" aria-label="Copy install link"
                            v-tooltip.top="'Copy install link'" />
                    </span>
                    <i class="pi pi-chevron-right text-xs text-[var(--p-text-muted-color)]" aria-hidden="true" />
                </div>
            </template>
        </Column>
        <template #empty>
            <div class="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <i class="pi pi-users text-3xl text-[var(--p-text-muted-color)]" />
                <div class="flex flex-col gap-1">
                    <span class="font-semibold">{{ hasActiveFilters ? 'No groups match your filters' : 'No groups yet'
                        }}</span>
                    <span class="text-sm text-[var(--p-text-muted-color)]">{{ hasActiveFilters
                        ? 'Try a different search or visibility filter.'
                        : 'Create a group to share builds with testers.' }}</span>
                </div>
                <Button v-if="hasActiveFilters" label="Clear filters" severity="secondary" @click="clearFilters" />
                <Button v-else label="New Group" @click="visible = true" />
            </div>
        </template>
    </DataTable>

    <Dialog v-model:visible="visible" modal header="New Group" :style="{ width: 'min(25rem, 90vw)' }">
        <form class="flex flex-col gap-4" @submit.prevent="saveNewGroup({
            appName: props.appName,
            orgName: props.orgName,
            groupName: newGroupName,
            isPublic: isPublic,
        })">
            <div class="flex flex-col gap-2">
                <label for="groupName" class="text-sm font-medium">Group name</label>
                <InputText id="groupName" v-model="newGroupName" autocomplete="off" placeholder="e.g. beta-testers"
                    required data-testid="group_name" />
            </div>
            <div class="flex items-start gap-3">
                <ToggleSwitch v-model="isPublic" inputId="isPublic" />
                <div class="flex flex-col">
                    <label for="isPublic" class="text-sm font-medium">Public group</label>
                    <span class="text-xs text-[var(--p-text-muted-color)]">
                        Anyone with the install link can access this group.
                    </span>
                </div>
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="visible = false" />
                <Button :loading="savingNewGroup" type="submit" label="Save" data-testid="create_group_save_btn" />
            </div>
        </form>
    </Dialog>
</template>

<script setup lang="ts">
import { DataTableRowClickEvent } from 'primevue/datatable';
import { formatDate } from '#imports';

const props = defineProps<{
    orgName: string,
    appName: string,
}>()

const toast = useToast()

const { data: list, refresh } = useFetch('/api/groups/list-groups', {
    query: {
        orgName: props.orgName,
        appName: props.appName,
    }
})

const search = ref('')
const visibility = ref<'all' | 'public' | 'private'>('all')
const visibilityOptions = [
    { label: 'All groups', value: 'all' },
    { label: 'Public', value: 'public' },
    { label: 'Private', value: 'private' },
]

const filteredList = computed(() => (list.value ?? []).filter((group) => {
    const term = search.value.trim().toLowerCase()
    const matchesSearch = !term
        || (group.displayName ?? '').toLowerCase().includes(term)
        || group.name.toLowerCase().includes(term)
    const matchesVisibility = visibility.value === 'all'
        || (visibility.value === 'public' ? group.isPublic : !group.isPublic)
    return matchesSearch && matchesVisibility
}))

const hasActiveFilters = computed(() => !!search.value.trim() || visibility.value !== 'all')

const clearFilters = () => {
    search.value = ''
    visibility.value = 'all'
}

const installLink = (group: any) => {
    if (!import.meta.client || !group?.publicId) return undefined
    return `${window.location.origin}/install/${props.orgName}/apps/${props.appName}/${group.publicId}`
}

const newGroupName = ref('')
const isPublic = ref(false)

const visible = ref(false)
watchEffect(() => {
    if (visible.value) {
        newGroupName.value = ''
        isPublic.value = false
    }
})

const { mutate: saveNewGroup, isPending: savingNewGroup } = useMutation({
    mutationFn: async (request: any) => {
        await $fetch('/api/groups/new-group', {
            body: request,
            method: 'post',
        })
    },
    onSuccess: () => {
        refresh()
        visible.value = false
    },
    onError: (error: any) => {
        toast.add({
            severity: 'error',
            detail: error.message,
            life: 5000,
        })
    },
})

const selectRow = async (row: DataTableRowClickEvent) => {
    navigateTo({
        name: 'orgs-orgName-apps-appId-groups-detailGroup',
        params: {
            detailGroup: row.data.name,
        },
    })
}
</script>

<style scoped>
:deep(.p-datatable-tbody > tr) {
    cursor: pointer;
}
</style>
