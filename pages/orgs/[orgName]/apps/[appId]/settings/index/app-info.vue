<template>
    <div v-if="!data">
        <ProgressSpinner style="width: 20px; width: 20px;" />
    </div>
    <div class="py-2" v-else>
        <form @submit.prevent="saveGroup" class="flex flex-col gap-5">
            <input name="currentOrgId" type="hidden" :value="data?.name" />
            <div class="flex flex-col gap-2">
                <label for="appDisplayName">App Name</label>
                <InputText name="appDisplayName" :value="data?.displayName" aria-describedby="app-display-name" />
            </div>
            <div class="flex flex-col gap-2">
                <label for="appName">App Id</label>
                <InputText name="appName" :value="data?.name" aria-describedby="app-name" />
            </div>
            <div class="flex flex-col gap-2">
                <label>Slug</label>
                <div class="flex flex-row gap-2">
                    <InputText :value="slug" readonly aria-describedby="slug" class="flex-1" data-testid="slug_input" />
                    <Button icon="pi pi-copy" @click="() => copyText(slug)" />
                </div>
            </div>
            <div class="flex flex-col md:flex-row gap-3 *:md:flex-1">
                <div class="flex flex-col gap-2">
                    <label>Organization Id</label>
                    <div class="flex flex-row gap-2">
                        <InputText :value="data?.organizationsId" readonly aria-describedby="Org Id" class="flex-1"
                            data-testid="orgid_input" />
                        <Button icon="pi pi-copy" @click="() => copyText(data?.organizationsId || undefined)" />
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <label>App Id</label>
                    <div class="flex flex-row gap-2">
                        <InputText :value="data?.id" readonly aria-describedby="App Id" class="flex-1"
                            data-testid="appid_input" />
                        <Button icon="pi pi-copy" @click="() => copyText(data?.id)" />
                    </div>
                </div>
            </div>
            <Button :loading="isPending" type="submit" class="sm:self-start" label="Save Changes" />
        </form>
    </div>
</template>

<script setup lang="ts">
import { copyText } from '#imports'

definePageMeta({
    name: 'app-info-settings',
})

const { params } = useRoute()
const orgName = computed(() => params.orgName as string)
const appName = computed(() => params.appId as string)
const slug = computed(() => `${orgName.value}/${appName.value}`)

const { data, execute } = useFetch('/api/detail-app', {
    query: {
        appName: appName,
        orgName: orgName,
    },
})

const { mutate, isPending } = useMutation({
    mutationFn: async (e: Event) => {
        const request = getObjectForm(e)
        const r = await $fetch('/api/apps/update-app-info', {
            method: 'post',
            body: {
                ...request,
                orgName: orgName.value,
            },
        })
        if (r.appName) {
            navigateTo({
                name: 'orgs-orgName-apps-appId',
                params: {
                    orgName: orgName.value,
                    appId: r.appName,
                },
            })
        }
        return r
    },
})
const saveGroup = (e: Event) => {
    mutate(e)
}
</script>