<template>
    <AppCard>
        <div class="flex gap-2 flex-col items-start">
            <span class="text-xs">Invitation Code</span>
            <form ref="form" @submit.prevent="() => create()">
                <div class="flex flex-row gap-2">
                    <InputText name="email" placeholder="Enter email" />
                    <Button :loading="createInviteStatus === 'pending'" type="submit" label="Create"
                        v-if="data?.canChange" />
                </div>
            </form>
        </div>
    </AppCard>
    <ProgressSpinner style="width: 22px; height: 22px; margin: unset;" strokeWidth="6"
        v-if="status === 'pending' || changeRoleIsPending || deleteRoleIsPending" />
    <div class="mt-3">
        <DataTable :show-gridlines="false" scrollable :value="listOrgPeople" single selectionMode="single" :pt="{
            menu: 'remove-bg-tabmenu',
            menuitem: 'remove-bg-tabmenu',
        }">
            <Column field="profileName" header="Name"></Column>
            <Column field="email" header="Email"></Column>
            <Column header="Role">
                <template #body="prop">
                    <form>
                        <div>
                            <Select :model-value="roles.find(e => e.id === prop.data.role)" name="role" :options="roles"
                                optionLabel="displayRole" placeholder="Select a role" @change="(v) => changeRole({
                                    dropdown: v,
                                    prop,
                                })" class="w-full md:w-14rem" v-if="data?.canChange" />
                            <div v-else>
                                <span>{{ roles.find(e => e.id === prop.data.role)?.displayRole }}</span>
                            </div>
                        </div>
                    </form>
                </template>
            </Column>
            <Column header="" v-if="data?.canChange">
                <template #body="prop">
                    <div>
                        <Button icon="pi pi-trash" severity="secondary" aria-label="Delete" @click="deleteRoleConfirm({
                            prop,
                        }, $event)" />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
    <Dialog v-model:visible="createIsVisible" modal header="Invitation Created" :style="{ width: '28rem' }">
        <div class="flex flex-col gap-2 mb-4 w-full">
            <span style="word-break: break-all;">{{ inviteLink }}</span>
            <span class="italic">Link active for 1 hour</span>
        </div>
        <div class="flex justify-content-end gap-3">
            <Button type="button" label="Ok, got it" severity="secondary" @click="createIsVisible = false"></Button>
            <Button type="button" label="Copy Link" @click="copyLink(inviteLink)"></Button>
        </div>
    </Dialog>
    <ConfirmPopup />
</template>

<script setup lang="ts">
import _ from 'lodash';

const form = ref()

const route = useRoute()
const orgName = route.params.orgName

const { data, refresh, status } = useFetch('/api/org-people/list-org-people', {
    query: {
        orgName,
    },
})
const listOrgPeople = computed(() => data.value?.people)

const inviteLink = ref('')
const createIsVisible = ref(false)
watchEffect(() => {
    if (!createIsVisible.value) {
        inviteLink.value = ''
    }
})
const { execute: create, status: createInviteStatus } = useAsyncData(async () => {
    const req = Object.fromEntries(new FormData(form.value).entries())
    const response = await $fetch('/api/invitations/create-invite-link', {
        body: {
            orgName,
            ...req,
        },
        method: 'post',
    })
    const params = new URLSearchParams({
        c: response.inviteLink,
    })
    const link = `${window.origin}/invitation?${params}`
    inviteLink.value = link
    createIsVisible.value = true
}, {
    immediate: false,
})
const copyLink = (value: string) => {
    navigator.clipboard.writeText(value);
}

const toast = useToast()

const roles = ref([
    { displayRole: 'Admin', id: 'admin' },
    { displayRole: 'Collaborator', id: 'collaborator' },
])
const { mutate: changeRole, isPending: changeRoleIsPending } = useMutation({
    mutationFn: async (req: any) => {
        const roleId = req.dropdown.value.id
        const email = req.prop.data.email
        await $fetch('/api/org-people/change-role', {
            method: 'post',
            body: { roleId, email, orgName },
        })
        refresh()
    },
    onError(error, variables, context) {
        toast.add({
            severity: 'error',
            detail: error.message,
            life: 5000,
        })
    },
})

const { mutate: deleteRole, isPending: deleteRoleIsPending } = useMutation({
    mutationFn: async (req: any) => {
        const email = req.prop.data.email
        await $fetch('/api/org-people/remove-user-from-org', {
            method: 'post',
            body: { email, orgName },
        })
        refresh()
    },
    onError(error, variables, context) {
        toast.add({
            severity: 'error',
            detail: error.message,
            life: 5000,
        })
    },
})

const confirm = useConfirm();
const deleteRoleConfirm = (req: any, event: any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'Do you want to remove this user?',
        icon: 'pi pi-info-circle',
        rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
        acceptClass: 'p-button-danger p-button-sm',
        rejectLabel: 'Cancel',
        acceptLabel: 'Remove',
        accept: () => {
            deleteRole(req)
        },
        reject: () => {
        }
    });
}
</script>
