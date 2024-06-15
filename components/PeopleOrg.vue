<template>
    <div class="flex gap-3 flex-col sm:flex-row items-center">
        <Button :loading="createInviteStatus === 'pending'" @click="() => create()" label="Create Invite Code" />
        <ProgressSpinner style="width: 22px; height: 22px; margin: unset;" strokeWidth="6"
            v-if="status === 'pending' || changeRoleIsPending" />
    </div>
    <div class="card p-0 mt-3">
        <DataTable scrollable :value="listOrgPeople" single selectionMode="single" :pt="{
            menu: 'remove-bg-tabmenu',
            menuitem: 'remove-bg-tabmenu',
        }">
            <Column field="profileName" header="Name"></Column>
            <Column field="email" header="Email"></Column>
            <Column header="Role">
                <template #body="prop">
                    <form>
                        <div>
                            <Dropdown :model-value="roles.find(e => e.id === prop.data.role)" name="role"
                                :options="roles" optionLabel="displayRole" placeholder="Select a role" @change="(v) => changeRole({
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
            <Column header="">
                <template #body="prop">
                    <form>
                        <div>
                            <Button icon="pi pi-trash" severity="secondary" aria-label="Delete" />
                        </div>
                    </form>
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

const { data, refresh, status } = useFetch('/api/list-org-people', {
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

const toast = useToast()

const roles = ref([
    { displayRole: 'Admin', id: 'admin' },
    { displayRole: 'Collaborator', id: 'collaborator' },
])
const { mutate: changeRole, isPending: changeRoleIsPending } = useMutation({
    mutationFn: async (req: any) => {
        const roleId = req.dropdown.value.id
        const email = req.prop.data.email
        await $fetch('/api/change-role', {
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
</script>
