<template>
    <AppBarContainer>
        <div class="flex-1 flex flex-row items-center gap-2">
            <div class="flex-1">
                <span class=" text-2xl font-bold">{{ title }}</span>
            </div>
            <div>
                <Button icon="pi pi-trash" severity="danger" @click="removeGroup" :loading="isPending" />
            </div>
        </div>
    </AppBarContainer>
    <div class="p-4">
        <div class="card p-4 items-center flex flex-col justify-stretch sm:flex-row sm:justify-center gap-2">
            <div class="flex flex-col flex-1">
                <div class="flex flex-wrap gap-2 items-stretch">
                    <span class="text-xl font-bold">{{ detailGroup?.displayName || detailGroup?.name }}</span>
                    <div v-if="detailGroup?.isPublic">
                        <Badge class="self-start" value="PUBLIC" severity="info" size="small"></Badge>
                    </div>
                </div>
                <span v-if="publicLink">Install link: <a class="underline break-all" target="_blank"
                        :href="publicLink">{{
                            publicLink
                        }}</a> </span>
            </div>
            <Button icon="pi pi-user" @click="() => showManageApptester = true" />
            <Button icon="pi pi-pencil" @click="() => groupSettings = true" />
            <!-- <Button icon="pi pi-refresh" label="Regenerate Link" @click="regenerateLink" /> -->
        </div>
    </div>
    <div class="px-4">
        <Releases :org-name="orgName" :app-name="appName" :os-type="'android'" :group-name="groupName" />
    </div>

    <LazyManageAppTester v-model="showManageApptester" />

    <Drawer v-model:visible="groupSettings" header="Group Settings" position="right" class="!w-[24rem]">
        <form @submit.prevent="mutateArtifactGroupData">
            <div class="flex flex-col gap-3 items-stretch">
                <input name="artifactGroupId" :value="detailGroup?.id" hidden />
                <input name="orgName" :value="orgName" hidden />
                <input name="appName" :value="appName" hidden />
                <div>
                    <span class="font-medium block mb-2">Group Name</span>
                    <InputGroup>
                        <InputText name="groupDisplayName" :value="detailGroup?.displayName" fluid></InputText>
                    </InputGroup>
                    <span class="text-sm mb-1">
                        <span>Name: </span>
                        <span>{{ groupName }}</span>
                    </span>
                </div>
                <div class="flex items-center gap-3 my-3">
                    <ToggleSwitch v-model="isPublic" :pt="{
                        input: {
                            'name': 'isPublic',
                            value: isPublic ? 'true' : 'false',
                        },
                    }" />
                    <label for="isPublic" class="text-sm"> Anyone with the link can access this group </label>
                </div>
                <Button type="submit" label="Update" class="self-start" :loading="updateArtifactGroupDataIsPending" />
            </div>
        </form>
    </Drawer>
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
        ? `${window.location.origin}/install/${orgName}/apps/${appName}/${detailGroup?.value?.publicId}`
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

const { mutate: removeGroupApi, isPending } = useMutation({
    mutationFn: async () => {
        await $fetch('/api/groups/delete-group', {
            method: 'post',
            body: {
                appName,
                orgName,
                groupName: groupName.value,
            },
        })
    },
    onSuccess: () => {
        navigateTo({
            name: 'orgs-orgName-apps-appId-index-groups',
        })
    }
})
const removeGroup = (event: any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'Remove group?',
        icon: 'pi pi-info-circle',
        accept: () => {
            removeGroupApi()
        },
        reject: () => {
        }
    });
}

const groupSettings = ref(false)
const showManageApptester = ref(false)

const isPublic = ref(detailGroup.value?.isPublic ?? false)
watchEffect(() => {
    isPublic.value = detailGroup.value?.isPublic ?? false
})

const { mutate: mutateArtifactGroupData, isPending: updateArtifactGroupDataIsPending } = useMutation({
    mutationFn: async (r: Event) => {
        const request = getObjectForm(r)
        const e = await $fetch.raw('/api/groups/update-artifact-group-data', {
            method: 'post',
            body: request,
        });
        if (e.ok) {
            groupSettings.value = false;
            const artifactGroupName = e._data!.artifactGroupName
            if (artifactGroupName === detailGroup.value?.name) {
                executeListGroups()
            }
            else {
                navigateTo({
                    name: 'orgs-orgName-apps-appId-groups-detailGroup',
                    replace: true,
                    force: true,
                    params: {
                        orgName: orgName,
                        appName: appName,
                        detailGroup: artifactGroupName,
                    },
                })
            }
        }
    },
})

const title = useTitleApp(computed(() => `${detailApp.data.value?.displayName} • Groups` || '-'))
</script>