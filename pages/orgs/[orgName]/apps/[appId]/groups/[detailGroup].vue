<template>
    <AppBarContainer>
        <div class="flex-1 flex flex-row items-center gap-2">
            <NuxtLink :to="{
                name: 'orgs-orgName-apps-appId-index-groups',
                params: { orgName, appId: appName },
            }">
                <Button icon="pi pi-arrow-left" text rounded aria-label="Back to groups"
                    v-tooltip.top="'Back to groups'" data-testid="back_to_groups_btn" />
            </NuxtLink>
            <div class="flex-1">
                <span class=" text-2xl font-bold">{{ title }}</span>
            </div>
            <div>
                <Button icon="pi pi-trash" severity="danger" outlined aria-label="Delete group"
                    v-tooltip.top="'Delete group'" @click="removeGroup" :loading="isPending" />
            </div>
        </div>
    </AppBarContainer>
    <div class="p-4">
        <div class="card p-4 flex flex-col gap-3">
            <div class="flex flex-wrap gap-2 items-stretch">
                <span class="text-xl font-bold">{{ detailGroup?.displayName || detailGroup?.name }}</span>
                <div v-if="detailGroup?.isPublic">
                    <Badge class="self-start" value="PUBLIC" severity="info" size="small"></Badge>
                </div>
                <div v-if="detailGroup?.secureLink">
                    <Badge class="self-start" value="SECURE LINK" severity="success" size="small"></Badge>
                </div>
            </div>
            <div v-if="publicLink" class="flex items-center gap-1 mb-2">
                <span class="break-words">Install link: <a class="underline break-all" target="_blank"
                        :href="publicLink">{{ publicLink }}</a></span>
                <AppCopyButton text rounded class="!h-6 !w-6 !p-0 shrink-0" aria-label="Copy install link"
                    v-tooltip.top="'Copy install link'" :textValue="() => publicLink"
                    data-testid="group_copy_link_btn" />
            </div>
            <div class="flex flex-row flex-wrap gap-2">
                <Button v-if="detailGroup?.isPublic" icon="pi pi-shield" severity="secondary" outlined
                    :label="detailGroup?.secureLink ? 'Change secure link' : 'Set secure link'"
                    aria-label="Set secure link"
                    v-tooltip.top="detailGroup?.secureLink ? 'Change secure link' : 'Set secure link'"
                    @click="openSecureLinkDialog" data-testid="group_secure_link_btn" />
                <Button v-if="detailGroup?.secureLink" icon="pi pi-shield" severity="danger" outlined
                    label="Remove secure link" aria-label="Remove secure link"
                    v-tooltip.top="'Remove secure link'" :loading="removeSecureLinkIsPending"
                    @click="removeSecureLinkConfirm" data-testid="group_remove_secure_link_btn" />
                <Button icon="pi pi-qrcode" severity="secondary" outlined aria-label="Show QR code"
                    v-tooltip.top="'Show QR code'" @click="() => showQrLink = true" data-testid="group_qr_btn" />
                <Button icon="pi pi-user" severity="secondary" outlined aria-label="Manage testers"
                    v-tooltip.top="'Manage testers'" @click="() => showManageApptester = true"
                    data-testid="group_testers_btn" />
                <Button icon="pi pi-pencil" severity="secondary" outlined aria-label="Group settings"
                    v-tooltip.top="'Group settings'" @click="() => groupSettings = true"
                    data-testid="group_settings_btn" />
            </div>
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
    <Dialog v-model:visible="showSecureLinkDialog" modal header="Set secure link" :style="{ width: '26rem' }">
        <form @submit.prevent="submitSecureLink" class="flex flex-col gap-3">
            <p class="text-sm text-[var(--p-text-muted-color)] m-0">
                Add a secret segment to the install link. Only people with the full link can access and install this
                group.
            </p>
            <div class="flex flex-col gap-1">
                <label for="secureLinkInput" class="text-sm font-medium">Secure link</label>
                <div class="flex gap-2">
                    <InputText id="secureLinkInput" v-model="secureLinkInput" class="flex-1" autocomplete="off"
                        spellcheck="false" placeholder="e.g. team-preview" data-testid="secure_link_input" />
                    <Button type="button" icon="pi pi-refresh" aria-label="Generate random secure link"
                        v-tooltip.top="'Generate random'" @click="secureLinkInput = generateSecureLink()"
                        data-testid="secure_link_generate_btn" />
                </div>
                <small class="text-xs text-[var(--p-text-muted-color)] break-all">
                    Appended to /install/{{ orgName }}/apps/{{ appName }}/{{ detailGroup?.publicId }}/
                </small>
                <small class="text-xs text-[var(--p-text-muted-color)]">
                    Letters, numbers, dash and underscore. {{ secureLinkMinLength }}-{{ secureLinkMaxLength }}
                    characters.
                </small>
                <small v-if="secureLinkError" class="text-xs text-red-500" data-testid="secure_link_error">
                    {{ secureLinkError }}
                </small>
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="showSecureLinkDialog = false" />
                <Button type="submit" label="Save" :loading="saveSecureLinkPending"
                    data-testid="secure_link_save_btn" />
            </div>
        </form>
    </Dialog>
    <Dialog v-model:visible="showQrLink" modal header="QR Link" style="width: 22rem;">
        <div class="px-4 pb-2 flex flex-col gap-4">
            <span class="text-center">Scan the following QR in your device to open the link</span>
            <QrCodeView :code="publicLink" />
            <AppCopyButton text label="Copy Link" :textValue="() => publicLink" />
        </div>
    </Dialog>
</template>

<script setup lang="ts">
const showQrLink = ref(false)
const toast = useToast()
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
    const group = detailGroup.value
    if (!import.meta.client || !group?.publicId) {
        return ''
    }
    const secureSegment = group.secureLink ? `/${group.secureLink}` : ''
    return `${window.location.origin}/install/${orgName}/apps/${appName}/${group.publicId}${secureSegment}`
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

const showSecureLinkDialog = ref(false)
const secureLinkInput = ref('')
const secureLinkError = ref('')

const openSecureLinkDialog = () => {
    secureLinkInput.value = detailGroup.value?.secureLink ?? ''
    secureLinkError.value = ''
    showSecureLinkDialog.value = true
}

const { mutate: mutateSetSecureLink, isPending: saveSecureLinkPending } = useMutation({
    mutationFn: async () => {
        await $fetch('/api/groups/set-secure-link', {
            method: 'post',
            body: {
                orgName,
                appName,
                artifactGroupId: detailGroup.value?.id,
                secureLink: secureLinkInput.value,
            },
        })
    },
    onSuccess: () => {
        showSecureLinkDialog.value = false
        executeListGroups()
        toast.add({
            severity: 'success',
            summary: 'Secure link saved',
            detail: 'Only people with the full link can access and install this group.',
            life: 5000,
        })
    },
    onError: (error: any) => {
        secureLinkError.value = error?.message || 'Could not save the secure link'
    },
})

const submitSecureLink = () => {
    const value = secureLinkInput.value
    if (value.length < secureLinkMinLength || value.length > secureLinkMaxLength || !secureLinkPattern.test(value)) {
        secureLinkError.value = `Use ${secureLinkMinLength}-${secureLinkMaxLength} letters, numbers, dash or underscore.`
        return
    }
    secureLinkError.value = ''
    mutateSetSecureLink()
}

const { mutate: removeSecureLinkApi, isPending: removeSecureLinkIsPending } = useMutation({
    mutationFn: async () => {
        await $fetch('/api/groups/remove-secure-link', {
            method: 'post',
            body: {
                orgName,
                appName,
                artifactGroupId: detailGroup.value?.id,
            },
        })
    },
    onSuccess: () => {
        executeListGroups()
    },
})
const removeSecureLinkConfirm = (event: any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'Remove secure link? The current secure link stops working, and anyone with the link can access this group.',
        icon: 'pi pi-info-circle',
        accept: () => {
            removeSecureLinkApi()
        },
        reject: () => {
        }
    });
}

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

const title = useTitleApp(computed(() => detailApp.data.value?.displayName
    ? `${detailApp.data.value.displayName} • Groups`
    : 'Groups'))

const copyLink = (value: string) => {
    navigator.clipboard.writeText(value);
}
</script>