<script setup lang="ts">
const { orgs } = await useOrgsStore()
const dialogRef = inject<any>('dialogRef');

const listOs = [
    'android',
    'ios'
]

const selectedOrg = ref()
const disableOrg = ref<boolean>(false)
const selectedOs = ref(null)
const appName = ref(null)

const orgName = dialogRef.value.data.orgName
if (orgName) {
    selectedOrg.value = orgs.value.find(v => v.name == orgName)
}
disableOrg.value = orgName != null

const { mutateAsync, isPending } = useMutation({
    mutationFn: (r: any) => $fetch('/api/create-app', {
        method: 'post',
        body: r,
    })
})

async function saveOrg() {
    await mutateAsync({
        name: appName.value,
        osType: selectedOs.value!,
        orgId: (selectedOrg.value as any).id,
    })
    dialogRef.value.close({
        refresh: true,
    });
}
</script>

<template>
    <form @submit.prevent="saveOrg">
        <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-2">
                <label>Organization</label>
                <Dropdown name="org" v-model="selectedOrg" :options="orgs" optionLabel="displayName"
                    :disabled="disableOrg" placeholder="Select organization" />
            </div>
            <div class="flex flex-col gap-2">
                <label>OS Type</label>
                <Dropdown v-model="selectedOs" :options="listOs" placeholder="Select OS Type" />
            </div>
            <div class="flex flex-col gap-2">
                <label>App Name</label>
                <InputText v-model="appName"></InputText>
            </div>
            <Button label="Save" class="mt-3" :loading="isPending" type="submit" />
        </div>
    </form>
</template>