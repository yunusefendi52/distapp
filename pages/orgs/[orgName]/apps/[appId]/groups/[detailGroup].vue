<template>
    <AppBarContainer>
        <span class="text-2xl font-bold">{{ detailApp.data.value?.displayName ?? '-' }}</span>
    </AppBarContainer>
    <div class="p-4">
        <div class="card p-4 justify-center items-center flex flex-row gap-2">
            <div class="flex flex-col flex-1">
                <span class="text-xl font-bold">{{ detailGroup?.name }}</span>
                <span v-if="publicLink">Public link: <a class="underline" target="_blank" :href="publicLink">{{
                    publicLink
                        }}</a> </span>
            </div>
            <Button icon="pi pi-refresh" label="Regenerate Link" @click="regenerateLink" />
        </div>
    </div>
    <div class="px-4">
        <Releases :org-name="orgName" :app-name="appName" :os-type="'android'" :group-name="groupName" />
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const params = route.params
const appName = params.appId as string
const orgName = params.orgName as string
const groupName = computed(() => params.detailGroup as string)

const detailApp = useFetch('/api/detail-app', {
    query: {
        appName: appName,
        orgName: orgName,
    },
})

const { data, execute: executeListGroups } = useFetch('/api/groups/list-groups', {
    query: {
        appName,
        orgName,
        groupName,
    },
})
const detailGroup = computed(() => data.value?.find(e => e))

const publicLink = computed(() => {
    return import.meta.client && detailGroup.value?.publicId
        ? `${window.location.origin}/install/${detailGroup?.value?.publicId}`
        : ''
})

const confirm = useConfirm();
const { mutate: regenerateLinkApi } = useMutation({
    mutationFn: async () => {
        await $fetch('/api/groups/regenerate-link', {
            method: 'post',
            body: {
                appName,
                orgName,
                groupId: detailGroup.value?.id,
            },
        })
    },
    onSuccess: () => {
        executeListGroups()
    }
})
const regenerateLink = (event: any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'This will cause your current link to be replaced. Do you want to regenerate public link?',
        icon: 'pi pi-info-circle',
        accept: () => {
            regenerateLinkApi()
        },
        reject: () => {
        }
    });
}

</script>