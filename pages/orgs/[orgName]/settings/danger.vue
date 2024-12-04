<template>
    <span class="text-lg">Do you really mean to delete this org? Type below "<span data-testid="org_name_span">{{
        orgName
            }}</span>"</span>
    <form ref="form" class="mt-5" action="/api/orgs/delete-org" method="get">
        <div class="flex flex-col gap-3 justify-start items-start">
            <InputText name="orgName" data-testid="orgName" placeholder='Here type your org id' required />
            <Button type="submit" label="Delete" severity="danger" data-testid="deleteOrgBtn" />
        </div>
    </form>
</template>

<script setup lang="ts">
const { params: { orgName } } = useRoute()

const form = ref<HTMLFormElement>()
if (import.meta.client) {
    onMounted(() => {
        if (form.value) {
            form.value.onsubmit = function (ev) {
                const objectForm = getObjectForm(ev)
                if (objectForm.orgName != orgName) {
                    alert("Org id is not valid")
                    return false;
                }
            }
        }
    })
    onUnmounted(() => {
        if (form.value) {
            form.value.onsubmit = null;
        }
    })
}
</script>
