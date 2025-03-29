<template>
    <Button class="mb-3" label="New Group" @click="visible = true"></Button>

    <div>
        <DataTable :show-gridlines="false" scrollable :value="list" single @row-click="selectRow($event)"
            selection-mode="single">
            <Column field="name" header="Group Name">
                <template #body="{ data }">
                    <div class="flex flex-row gap-3 py-3">
                        <span class="font-semibold text-xl">{{ data.displayName || data.name }}</span>
                        <Badge :value="data.isPublic ? 'PUBLIC' : 'PRIVATE'"
                            :severity="data.isPublic ? 'info' : 'contrast'">
                        </Badge>
                    </div>
                </template>
            </Column>
            <template #empty>
                <div class="flex items-center justify-center">
                    <label>No data found</label>
                </div>
            </template>
        </DataTable>
    </div>

    <Dialog v-model:visible="visible" modal header="New Group" :style="{ width: '25rem' }">
        <form @submit.prevent="saveNewGroup({
            appName: props.appName,
            orgName: props.orgName,
            groupName: newGroupName,
            isPublic: isPublic,
        })">
            <div class="flex align-items-center gap-3 mb-3">
                <InputText v-model="newGroupName" class="flex-auto" autocomplete="off" placeholder="Group Name" required
                    data-testid="group_name" />
            </div>
            <div class="flex items-center gap-3 my-3">
                <ToggleSwitch v-model="isPublic" name="isPublic" />
                <label for="isPublic" class="text-sm"> Anyone with the link can access this group </label>
            </div>
            <div class="flex justify-content-end gap-2 mt-5">
                <Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
                <Button :loading="savingNewGroup" type="submit" label="Save"></Button>
            </div>
        </form>
    </Dialog>
</template>

<script setup lang="ts">
import { DataTableRowClickEvent } from 'primevue/datatable';

const props = defineProps<{
    orgName: string,
    appName: string,
}>()

const { data: list, refresh } = useFetch('/api/groups/list-groups', {
    query: {
        orgName: props.orgName,
        appName: props.appName,
    }
})

const newGroupName = ref('')
const isPublic = ref(false)

const visible = ref(false)
watchEffect(() => {
    if (visible.value) {
        newGroupName.value = ''
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
    }
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