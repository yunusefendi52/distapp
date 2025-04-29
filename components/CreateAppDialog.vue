<script setup lang="ts">
const { orgs } = await useOrgsStore()
const dialogRef = inject<any>('dialogRef');

const listOs = [
    {
        label: 'Android',
        value: 'android',
    },
    {
        label: 'iOS',
        value: 'ios',
    },
]

const selectedOrg = ref<typeof orgs.value[0]>()
const disableOrg = ref<boolean>(false)
const selectedOs = ref<typeof listOs[0] | undefined>(undefined)
const appName = ref(null)

const orgName = dialogRef.value.data.orgName
if (orgName) {
    selectedOrg.value = orgs.value.find(v => v.name == orgName)
}
disableOrg.value = orgName != null

const { mutateAsync, isPending } = useMutation({
    mutationFn: (r: any) => $fetch.raw('/api/create-app', {
        method: 'post',
        body: r,
    }).then(e => e._data)
})

async function saveApp() {
    await mutateAsync({
        name: appName.value,
        osType: selectedOs.value?.value,
        orgId: selectedOrg.value!.id,
    })
    dialogRef.value.close({
        refresh: true,
    });
}

const {
    addOrgVisible,
    saveOrg,
    isPending: isPendingOrg,
    orgName: orgNameRef,
    onCreateOrgData,
} = await useCreateOrg()

watchEffect(() => {
    const createdData = onCreateOrgData.value
    const orgsValue = orgs.value
    console.log('changeddd', { createdData, orgsValue })
    if (createdData && orgsValue) {
        selectedOrg.value = orgsValue.find(v => v.name === createdData.normalizedOrgName)
    }
})
</script>

<template>
    <form data-testid="createAppDialogForm" @submit.prevent="saveApp">
        <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-2">
                <label>Organization</label>
                <Select name="org" v-model="selectedOrg" :options="orgs" optionLabel="displayName"
                    :disabled="disableOrg" placeholder="Select organization">
                    <template #footer>
                        <div class="px-2 pb-2">
                            <Button data-testid="addNewOrgbtn" label="Add New" fluid severity="secondary" text
                                size="small" icon="pi pi-plus" @click="() => addOrgVisible = true" />
                        </div>
                    </template>
                </Select>
            </div>
            <div class="flex flex-col gap-2">
                <label>Platform</label>
                <Dropdown data-testid="dropdown_platform" v-model="selectedOs" optionLabel="label" :options="listOs"
                    placeholder="Select Platform" />
            </div>
            <div class="flex flex-col gap-2">
                <label>App Name</label>
                <InputText data-testid="inputAppName" v-model="appName"></InputText>
            </div>
            <Button label="Save" class="mt-3" :loading="isPending" type="submit" />
        </div>
    </form>

    <Dialog v-model:visible="addOrgVisible" modal header="Add Organization">
        <form @submit.prevent="saveOrg">
            <div class="flex flex-col gap-3 w-25rem">
                <InputText placeholder="Name" data-testid="orgname" name="name" v-model="orgNameRef"></InputText>
                <Button data-testid="orgsavebtn" label="Save" type="submit" :loading="isPendingOrg"></Button>
            </div>
        </form>
    </Dialog>
</template>