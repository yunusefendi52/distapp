<template>
    <Drawer v-model:visible="isVisible" position="right" class="!w-[28rem]" header="Manage Testers">
        <div class="flex flex-col gap-3">
            <AppCard class="flex flex-col gap-1 justify-stretch !p-2">
                <form @submit.prevent="mutate">
                    <div class="flex flex-row gap-2">
                        <InputText class="flex-1" name="email" placeholder="Email" size="small" />
                        <Button label="Create Invitation" size="small" :loading="isPending" type="submit" />
                    </div>
                    <div class="flex flex-row gap-2 mt-2 items-center" v-if="data">
                        <span class="flex-1 text-sm">Link invitation created</span>
                        <Button label="Click to copy" size="small" outlined @click="() => copyLink(data)" />
                    </div>
                </form>
            </AppCard>
            <div class="flex flex-col gap-3">
                <template v-if="testers.length">
                    <AppCard v-for="tester in testers" class="!p-0">
                        <div class="p-3 flex flex-row gap-2 items-center">
                            <span class="flex-1">{{ tester.users?.email }}</span>
                            <Button icon="pi pi-trash" severity="danger" outlined @click="() => removeTester({
                                userId: tester.users!.id!,
                            })" :loading="removeStatus === 'pending'" />
                        </div>
                    </AppCard>
                </template>
                <div v-else class="mt-1">
                    <span>No tester yet</span>
                </div>
            </div>
        </div>
    </Drawer>
</template>

<script setup lang="ts">
import { copyText } from '#imports'
const isVisible = defineModel<boolean>()

const { params: { appId, orgName, detailGroup: groupName } } = useRoute()

const { data: listTester, execute: getListTester } = useFetch('/api/apps/testers/list-tester', {
    method: 'get',
    query: {
        orgName,
        appName: appId,
        groupName,
    },
})
const testers = computed(() => listTester.value?.testers ?? [])
watchEffect(() => {
    if (isVisible.value) {
        getListTester()
    }
})

const { mutate, isPending, data } = useMutation({
    async mutationFn(r: any) {
        const request = getObjectForm(r)
        return await $fetch.raw('/api/apps/testers/create-invitation-tester', {
            method: 'post',
            body: {
                orgName,
                appName: appId,
                groupName,
                ...request,
            },
            onResponseError(error) {
                showErrorAlert(error)
            },
        }).then(e => e._data?.testerInviteLink)
    },
})
function copyLink(value: string | undefined) {
    const link = `${window.location.origin}/install/join-tester?c=${value}`
    copyText(link)
}

const { mutate: removeTester, status: removeStatus } = useMutation({
    mutationFn: async (r: { userId: string }) => {
        if (confirm('Do you want remove this tester?')) {
            await $fetch.raw('/api/apps/testers/remove-tester', {
                method: 'post',
                body: {
                    orgName,
                    appName: appId,
                    groupName,
                    ...r,
                },
                onResponse() {
                    getListTester()
                },
                onResponseError(error) {
                    showErrorAlert(error)
                }
            })
        }
    },
})
</script>