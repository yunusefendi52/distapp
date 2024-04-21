<template>
    <Button class="mb-3" label="New Group" @click="visible = true"></Button>
    
    <div class="card p-0">
        <DataTable :value="list" single>
            <Column field="name" header="Group Name"></Column>
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
    })">
            <div class="flex align-items-center gap-3 mb-3">
                <InputText v-model="newGroupName" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
                <Button :loading="savingNewGroup" type="submit" label="Save"></Button>
            </div>
        </form>
    </Dialog>
</template>

<script setup lang="ts">
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

</script>