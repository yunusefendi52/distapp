<template>
    <div class="flex gap-3 flex-col sm:flex-row">
        <Button :loading="createInviteStatus === 'pending'" @click="() => create()" label="Create Invite Code" />
    </div>
    <div class="card p-0 mt-3">
        <DataTable scrollable :value="data" single selectionMode="single" :pt="{
            menu: 'remove-bg-tabmenu',
            menuitem: 'remove-bg-tabmenu',
        }">
            <Column field="profileName" header="Name"></Column>
            <Column field="email" header="Email"></Column>
            <Column header="">
                <template #body="prop">
                    <div>
                        <Button icon="pi pi-trash" severity="secondary" aria-label="Delete" />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
    <Dialog v-model:visible="createIsVisible" modal header="Invite Code Created" :style="{ width: '25rem' }">
        <div class="flex flex-col gap-2 mb-4 w-full">
            <span class="p-text-secondary block">This code only active for 1 hour</span>
            <span style="word-wrap: break-word;">{{ inviteLink }}</span>
        </div>
        <div class="flex justify-content-end gap-3">
            <Button type="button" label="Ok, got it" severity="secondary" @click="createIsVisible = false"></Button>
            <Button type="button" label="Copy Code" @click="copyLink(inviteLink)"></Button>
        </div>
    </Dialog>

</template>

<script setup lang="ts">
import _ from 'lodash';

const route = useRoute()
const orgName = route.params.orgName

const { data } = useFetch('/api/list-org-people', {
    query: {
        orgName,
    },
})

const inviteLink = ref('')
const createIsVisible = ref(false)
watchEffect(() => {
    if (!createIsVisible.value) {
        inviteLink.value = ''
    }
})
const { execute: create, status: createInviteStatus } = useAsyncData(async () => {
    const response = await $fetch('/api/invitations/create-invite-link', {
        body: {
            orgName,
        },
        method: 'post',
    })
    inviteLink.value = response.inviteLink
    createIsVisible.value = true
}, {
    immediate: false,
})
const copyLink = (value: string) => {
    navigator.clipboard.writeText(value);
}
</script>
