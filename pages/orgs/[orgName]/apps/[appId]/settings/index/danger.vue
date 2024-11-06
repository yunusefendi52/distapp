<template>
    <span class="text-lg">Do you really mean to delete this app? Type below "{{ appId }}"</span>
    <form ref="form" class="mt-5" action="/api/apps/delete-app" method="get">
        <div class="flex flex-col gap-3 justify-start items-start">
            <input name="orgName" :value="orgName" hidden />
            <InputText name="appName" placeholder='Here type your app id' required />
            <Button type="submit" label="Delete" severity="danger" />
        </div>
    </form>
</template>

<script setup lang="ts">
definePageMeta({
    name: 'settings-danger-app',
})
const { params: { orgName, appId } } = useRoute()

const form = ref<HTMLFormElement>()
if (import.meta.client) {
    onMounted(() => {
        if (form.value) {
            form.value.onsubmit = function (ev) {
                const objectForm = getObjectForm(ev)
                if (objectForm.appName != appId) {
                    alert("App id is not valid")
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
